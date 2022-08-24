import { ReactSource } from "@cycle/react"
import {
  combineLatest,
  distinctUntilChanged,
  EMPTY,
  map,
  merge,
  Observable,
  share,
  startWith,
  switchMap,
} from "rxjs"
import { match } from "ts-pattern"
import { filterResultErr, filterResultOk } from "ts-results/rxjs-operators"
import { getOpp$, ID, isOwnedBy, me$, Source as GraphSource } from "~/graph"
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
  props: Props
}

export const Single = (sources: Sources, tagPrefix?: string) => {
  const tagScope = `${tagPrefix}/Single`
  const tag = makeTagger(tagScope)

  const {
    props: { state$: oppsState$, id$, location },
  } = sources

  const result$ = id$.pipe(
    switchMap((id) => getOpp$(id)),
    share()
  )

  const record$ = result$.pipe(filterResultOk(), tag("record$"), shareLatest())

  const userError$ = result$.pipe(filterResultErr(), tag("userError$"), share())

  const isLoading$ = combineLatest({ id: id$, opp: record$ }).pipe(
    map(({ id, opp }) => opp.id !== id),
    startWith(true),
    tag("isLoading$"),
    shareLatest()
  )

  const userErrorNotice$ = userError$.pipe(
    map(({ message }) => error({ description: message })),
    tag("userErrorNotice$"),
    share()
  )

  const edit = Edit({ ...sources, props: { record$, location } }, tagScope)
  const show = Show({ ...sources, props: { record$, location } }, tagScope)

  const state$ = combineLatest({
    isLoading: isLoading$,
    oppsState: oppsState$,
    opp: record$,
    me: me$,
  }).pipe(
    map(({ isLoading, oppsState, opp, me }) => {
      if (oppsState !== OppsState.single || isLoading) return State.pending
      // ! TODO: how present edit without a distinct url/param?
      // return isOwnedBy(opp, me) ? State.edit : State.show
      return State.show
    }),
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
