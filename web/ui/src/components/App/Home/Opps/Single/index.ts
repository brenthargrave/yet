import { ReactSource } from "@cycle/react"
import {
  combineLatest,
  distinctUntilChanged,
  EMPTY,
  map,
  merge,
  mergeWith,
  Observable,
  share,
  startWith,
  switchMap,
} from "rxjs"
import { pluck } from "rxjs-etc/dist/esm/operators"
import { match } from "ts-pattern"
import { filterResultErr, filterResultOk } from "ts-results/rxjs-operators"
import { Actions, Source as ActionSource } from "~/action"
import {
  getOppProfile$,
  ID,
  isOwnedBy,
  me$,
  Source as GraphSource,
} from "~/graph"
import { makeTagger } from "~/log"
import { error } from "~/notice"
import { shareLatest } from "~/rx"
import { Location, State as OppsState } from ".."
import { Edit } from "./Edit"
import { Show } from "./Show"

export { Location }

export enum State {
  pending = "pending",
  edit = "edit",
  show = "show",
}

interface Props {
  state$: Observable<OppsState>
  id$: Observable<ID>
  location: Location
}

interface Sources {
  react: ReactSource
  graph: GraphSource
  action: ActionSource
  props: Props
}

export const Single = (sources: Sources, tagPrefix?: string) => {
  const tagScope = `${tagPrefix}/Single`
  const tag = makeTagger(tagScope)

  const {
    action: { action$ },
    props: { state$: oppsState$, id$, location },
  } = sources

  const result$ = id$.pipe(
    switchMap((id) => getOppProfile$({ id })),
    share()
  )

  const oppProfile$ = result$.pipe(
    filterResultOk(),
    tag("record$"),
    shareLatest()
  )
  const opp$ = oppProfile$.pipe(pluck("opp"), tag("opp$"), shareLatest())

  const userError$ = result$.pipe(filterResultErr(), tag("userError$"), share())

  const isLoading$ = combineLatest({ id: id$, oppProfile: oppProfile$ }).pipe(
    map(({ id, oppProfile }) => oppProfile.opp.id !== id),
    startWith(true),
    tag("isLoading$"),
    shareLatest()
  )

  const userErrorNotice$ = userError$.pipe(
    map(({ message }) => error({ description: message })),
    tag("userErrorNotice$"),
    share()
  )

  const edit = Edit({ ...sources, props: { opp$, location } }, tagScope)
  const show = Show({ ...sources, props: { oppProfile$, location } }, tagScope)

  const internalRouter$ = action$.pipe(
    map((action) =>
      match(action)
        .with({ type: Actions.editOpp }, () => State.edit)
        .with({ type: Actions.showOpp }, () => State.show)
        .otherwise(() => State.show)
    ),
    share()
  )

  const state$ = combineLatest({
    isLoading: isLoading$,
    oppsState: oppsState$,
    opp: oppProfile$,
    me: me$,
  }).pipe(
    map(({ isLoading, oppsState, opp, me }) => {
      if (oppsState !== OppsState.single || isLoading) return State.pending
      return State.show
    }),
    mergeWith(internalRouter$),
    startWith(State.pending),
    distinctUntilChanged(),
    tag("state$"),
    shareLatest()
  )

  const react = state$.pipe(
    switchMap((state) =>
      match(state)
        .with(State.pending, () => EMPTY)
        .with(State.edit, () => edit.react)
        .with(State.show, () => show.react)
        .exhaustive()
    ),
    tag("react")
  )

  const action = merge(edit.action, show.action)
  const notice = merge(userErrorNotice$, edit.notice)

  return {
    react,
    notice,
    action,
  }
}
