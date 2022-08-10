import { h, ReactSource } from "@cycle/react"
import {
  combineLatest,
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
} from "rxjs"
import { match } from "ts-pattern"
import { ulid } from "ulid"
import { and, not } from "~/fp"
import {
  isValidOrg,
  isValidRole,
  Source as GraphSource,
  upsertOpp$,
} from "~/graph"
import { makeTagger } from "~/log"
import { routes, Source as RouterSource } from "~/router"
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
  const id$ = record$.pipe(
    map((record) => record.id),
    tag("id$"),
    shareLatest()
  )

  const [onChangeOrg, onChangeOrg$] = cb$<string>(tag("onChangeOrg$"))
  const [onChangeRole, onChangeRole$] = cb$<string>(tag("onChangeRole$"))
  const [onChangeDesc, onChangeDesc$] = cb$<string>(tag("onChangeDesc$"))
  const [onSubmit, onSubmit$] = cb$(tag("onSubmit$"))

  const org$: Observable<string> = record$.pipe(
    pluck("org"),
    mergeWith(onChangeOrg$)
  )
  const role$: Observable<string> = record$.pipe(
    pluck("role"),
    mergeWith(onChangeRole$)
  )
  const desc$: Observable<string> = record$.pipe(
    pluck("desc"),
    mergeWith(onChangeDesc$)
  )

  const payload$ = combineLatest({
    id: id$,
    org: org$,
    role: role$,
    desc: desc$,
  }).pipe(tag("payload$"), share())

  const isValid$ = payload$.pipe(
    map(({ org, role }) => and(isValidOrg(org), isValidRole(role))),
    tag("isValid$"),
    startWith(false),
    shareLatest()
  )

  const isDisabledSubmit$ = isValid$.pipe(
    map(not),
    startWith(true),
    tag("isDisabledSubmit$"),
    shareLatest()
  )

  const submit$ = onSubmit$.pipe(
    withLatestFrom(payload$),
    switchMap(([_, input]) => upsertOpp$(input)),
    tag("submit$"),
    share()
  )

  const props$ = combineLatest({
    defaultValueOrg: org$,
    defaultValueRole: role$,
    defaultValueDesc: desc$,
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
      })
    )
  )

  return {
    react,
  }
}
