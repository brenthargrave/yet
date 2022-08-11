import { h, ReactSource } from "@cycle/react"
import {
  combineLatest,
  debounceTime,
  distinctUntilChanged,
  EMPTY,
  map,
  mergeWith,
  Observable,
  of,
  pluck,
  share,
  startWith,
  switchMap,
  withLatestFrom,
  merge,
  distinctUntilKeyChanged,
} from "rxjs"
import { match } from "ts-pattern"
import { filterResultErr, filterResultOk } from "ts-results/rxjs-operators"
import { ulid } from "ulid"
import { and, not } from "~/fp"
import {
  isValidOrg,
  isValidRole,
  Opp,
  Source as GraphSource,
  upsertOpp$,
} from "~/graph"
import { makeTagger } from "~/log"
import { error } from "~/notice"
import { push, routes, Source as RouterSource } from "~/router"
import { cb$, shareLatest } from "~/rx"
import { View } from "./View"

interface Sources {
  react: ReactSource
  router: RouterSource
  graph: GraphSource
}

export const Main = (sources: Sources, tagPrefix?: string) => {
  const tagScope = `${tagPrefix}/Create`
  const tag = makeTagger(tagScope)

  const {
    graph: { opps$ },
    router: { history$ },
  } = sources

  const record$ = history$.pipe(
    switchMap((route) =>
      match(route.name)
        .with(routes.newConversationNewOpp.name, () =>
          of({
            id: ulid(),
            org: "",
            role: "",
            desc: "",
          })
        )
        .otherwise(() => EMPTY)
    ),
    tag("record$"),
    shareLatest()
  )
  const id$ = record$.pipe(pluck("id"), tag("id$"), shareLatest())
  const recordOrg$ = record$.pipe(pluck("org"), tag("org$"), shareLatest())
  const recordRole$ = record$.pipe(pluck("role"), tag("role$"), shareLatest())
  const recordDesc$ = record$.pipe(pluck("desc"), tag("desc$"), shareLatest())

  const [onChangeOrg, onChangeOrg$] = cb$<string>(tag("onChangeOrg$"))
  const [onChangeRole, onChangeRole$] = cb$<string>(tag("onChangeRole$"))
  const [onChangeDesc, onChangeDesc$] = cb$<string>(tag("onChangeDesc$"))
  const [onSubmit, onSubmit$] = cb$(tag("onSubmit$"))
  const [onCancel, onCancel$] = cb$(tag("onCancel$"))

  const org$: Observable<string> = record$.pipe(
    pluck("org"),
    mergeWith(onChangeOrg$),
    tag("org$"),
    share()
  )
  const role$: Observable<string> = record$.pipe(
    pluck("role"),
    mergeWith(onChangeRole$),
    tag("role$"),
    share()
  )
  const desc$: Observable<string> = record$.pipe(
    pluck("desc"),
    mergeWith(onChangeDesc$),
    tag("desc$"),
    share()
  )

  const payload$ = combineLatest({
    id: id$,
    org: org$,
    role: role$,
    desc: desc$,
  }).pipe(tag("payload$"), share())

  const isValid$ = payload$.pipe(
    debounceTime(100),
    map(({ org, role }) => {
      const orgValid = isValidOrg(org)
      const roleValid = isValidRole(role)
      return and(orgValid, roleValid)
    }),
    tag("isValid$"),
    startWith(false),
    distinctUntilChanged(),
    shareLatest()
  )

  const isDisabledSubmit$ = isValid$.pipe(
    map(not),
    startWith(true),
    distinctUntilChanged(),
    tag("isDisabledSubmit$"),
    shareLatest()
  )

  const submit$ = onSubmit$.pipe(
    withLatestFrom(payload$),
    switchMap(([_, input]) => upsertOpp$(input)),
    tag("submit$"),
    share()
  )

  const opp$ = submit$.pipe(filterResultOk(), tag("opp$"), share())
  const userError$ = submit$.pipe(filterResultErr(), tag("userError$"), share())

  const redirectToList$ = merge(onCancel$, opp$).pipe(
    map((_opp) => push(routes.newConversationOpps())),
    tag("redirectToList$"),
    share()
  )

  const userErrorNotice$ = userError$.pipe(
    map(({ message }) => error({ description: message })),
    tag("userErrorNotice$"),
    share()
  )

  const props$ = combineLatest({
    defaultValueOrg: recordOrg$,
    defaultValueRole: recordRole$,
    defaultValueDesc: recordDesc$,
    isDisabledSubmit: isDisabledSubmit$,
  }).pipe(tag("props$"), share())

  const react = props$.pipe(
    map((props) =>
      h(View, {
        ...props,
        onChangeOrg,
        onChangeRole,
        onChangeDesc,
        onSubmit,
        onCancel,
      })
    )
  )

  const router = merge(redirectToList$)
  const notice = merge(userErrorNotice$)
  return {
    react,
    router,
    notice,
  }
}
