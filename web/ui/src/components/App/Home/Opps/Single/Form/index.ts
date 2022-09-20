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
import { act, Actions } from "~/action"
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
import { cb$, mapTo, shareLatest } from "~/rx"
import { Target, View } from "./View"
import { Location } from ".."

export { Target }

type EditableOpp = Omit<Opp, "creator" | "owner" | "insertedAt">

interface Props {
  record$: Observable<EditableOpp>
  target: Target
  location: Location
}

interface Sources {
  react: ReactSource
  graph: GraphSource
  props: Props
}

export const Form = (sources: Sources, tagPrefix?: string) => {
  const tagScope = `${tagPrefix}/Form`
  const tag = makeTagger(tagScope)

  const {
    props: { record$, target, location },
  } = sources

  const id$ = record$.pipe(pluck("id"), tag("id$"), share())
  const recordOrg$ = record$.pipe(pluck("org"), tag("recordOrg$"), share())
  const recordRole$ = record$.pipe(pluck("role"), tag("recordRole$"), share())
  const recordDesc$ = record$.pipe(pluck("desc"), tag("recordDesc$"), share())
  const recordUrl$ = record$.pipe(pluck("url"), tag("recordUrl$"), share())
  const recordFee$ = record$.pipe(pluck("fee"), tag("recordFee$"), share())

  const [onChangeOrg, onChangeOrg$] = cb$<string>(tag("onChangeOrg$"))
  const [onChangeRole, onChangeRole$] = cb$<string>(tag("onChangeRole$"))
  const [onChangeDesc, onChangeDesc$] = cb$<string>(tag("onChangeDesc$"))
  const [onChangeUrl, onChangeUrl$] = cb$<string>(tag("onChangeUrl$"))
  const [onChangeFee, onChangeFee$] = cb$<Money>(tag("onChangeFee$"))
  const [onSubmit, onSubmit$] = cb$(tag("onSubmit$"))
  const [onCancel, onCancel$] = cb$(tag("onCancel$"))
  const [onClickBack, onClickBack$] = cb$(tag("onClickBack$"))
  const goToList$ = merge(onClickBack$).pipe(
    mapTo(act(Actions.listOpps)),
    tag("onClickBack$"),
    share()
  )
  const [onClickShow, onClickShow$] = cb$(tag("onClickShow$"))
  const clickShow$ = onClickShow$.pipe(
    withLatestFrom(record$),
    map(([_, opp]) => act(Actions.showOpp, { opp })),
    tag("clickShow$"),
    share()
  )

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
  const url$ = record$.pipe(
    pluck("url"),
    mergeWith(onChangeUrl$),
    tag("url$"),
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
    url: url$,
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

  const showList$ = merge(onCancel$, opp$).pipe(
    mapTo(act(Actions.showOpp)),
    tag("showList$"),
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
    defaultValueUrl: recordUrl$,
    defaultValueFee: recordFee$,
    isDisabledSubmit: isDisabledSubmit$,
  }).pipe(tag("props$"))

  const react = props$.pipe(
    map((props) =>
      h(View, {
        ...props,
        location,
        target,
        onChangeOrg,
        onChangeRole,
        onChangeDesc,
        onChangeUrl,
        onChangeFee,
        onSubmit,
        onCancel,
        onClickBack,
        onClickShow,
      })
    )
  )

  const action = merge(showList$, goToList$, clickShow$)
  const notice = merge(userErrorNotice$)
  return {
    react,
    notice,
    action,
  }
}
