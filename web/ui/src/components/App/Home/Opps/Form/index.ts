import { h, ReactSource } from "@cycle/react"
import {
  combineLatest,
  debounceTime,
  distinctUntilChanged,
  map,
  merge,
  mergeWith,
  Observable,
  pluck,
  share,
  startWith,
  switchMap,
  withLatestFrom,
} from "rxjs"
import { filterResultErr, filterResultOk } from "ts-results/rxjs-operators"
import { and, not, pick } from "~/fp"
import {
  isValidOrg,
  isValidRole,
  Money,
  Opp,
  Source as GraphSource,
  upsertOpp$,
} from "~/graph"
import { makeTagger } from "~/log"
import { error } from "~/notice"
import { push, routes, Source as RouterSource } from "~/router"
import { cb$ } from "~/rx"
import { View, Target } from "./View"

export { Target }

type EditableOpp = Omit<Opp, "creator">

interface Props {
  record$: Observable<EditableOpp>
  target: Target
}

interface Sources {
  react: ReactSource
  router: RouterSource
  graph: GraphSource
  props: Props
}

export const Main = (sources: Sources, tagPrefix?: string) => {
  const tagScope = `${tagPrefix}/Form`
  const tag = makeTagger(tagScope)

  const {
    graph: { opps$ },
    router: { history$ },
    props: { record$, target },
  } = sources

  const id$ = record$.pipe(pluck("id"), tag("id$"), share())
  const recordOrg$ = record$.pipe(pluck("org"), tag("recordOrg$"), share())
  const recordRole$ = record$.pipe(pluck("role"), tag("recordRole$"), share())
  const recordDesc$ = record$.pipe(pluck("desc"), tag("recordDesc$"), share())
  const recordFee$ = record$.pipe(pluck("fee"), tag("recordFee$"), share())

  const [onChangeOrg, onChangeOrg$] = cb$<string>(tag("onChangeOrg$"))
  const [onChangeRole, onChangeRole$] = cb$<string>(tag("onChangeRole$"))
  const [onChangeDesc, onChangeDesc$] = cb$<string>(tag("onChangeDesc$"))
  const [onChangeFee, onChangeFee$] = cb$<Money>(tag("onChangeFee$"))
  const [onSubmit, onSubmit$] = cb$(tag("onSubmit$"))
  const [onCancel, onCancel$] = cb$(tag("onCancel$"))

  const org$ = record$.pipe(
    pluck("org"),
    mergeWith(onChangeOrg$),
    tag("org$"),
    share()
  )
  const role$ = record$.pipe(
    pluck("role"),
    mergeWith(onChangeRole$),
    tag("role$"),
    share()
  )
  const desc$ = record$.pipe(
    pluck("desc"),
    mergeWith(onChangeDesc$),
    tag("desc$"),
    share()
  )
  const fee$ = record$.pipe(
    map(({ fee }) => pick(["amount", "currency"], fee)),
    mergeWith(onChangeFee$),
    tag("fee$"),
    share()
  )

  const payload$ = combineLatest({
    id: id$,
    org: org$,
    role: role$,
    desc: desc$,
    fee: fee$,
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
    share()
  )

  const isDisabledSubmit$ = isValid$.pipe(
    map(not),
    startWith(true),
    distinctUntilChanged(),
    tag("isDisabledSubmit$"),
    share()
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
    defaultValueFee: recordFee$,
    isDisabledSubmit: isDisabledSubmit$,
  }).pipe(tag("props$"))

  const react = props$.pipe(
    map((props) =>
      h(View, {
        ...props,
        target,
        onChangeOrg,
        onChangeRole,
        onChangeDesc,
        onChangeFee,
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
