import { h, ReactSource } from "@cycle/react"
import {
  combineLatest,
  distinctUntilChanged,
  EMPTY,
  map,
  merge,
  of,
  share,
  startWith,
  switchMap,
} from "rxjs"
import { filterResultOk } from "ts-results/rxjs-operators"
import { Source as ActionSource } from "~/action"
import { getTimeline$, Source as GraphSource } from "~/graph"
import { makeTagger } from "~/log"
import { NEWID, push, routes } from "~/router"
import { cb$, mapTo, shareLatest } from "~/rx"
import { View, State } from "./View"

export interface Sources {
  react: ReactSource
  graph: GraphSource
  action: ActionSource
}

export const Timeline = (sources: Sources, tagPrefix?: string) => {
  const tagScope = `${tagPrefix}/Timeline`
  const tag = makeTagger(tagScope)

  const {
    graph: { me$, conversations$ },
  } = sources

  const [onClickNew, clickNew$] = cb$(tag("clickNew$"))
  const newConvo$ = clickNew$.pipe(
    map(() => push(routes.conversation({ id: NEWID })))
  )

  // ! Opps
  // X, Y discussed [Opp], [Opp2] and [Opp3]

  const result$ = getTimeline$().pipe(tag("result$"), share())

  const events$ = result$.pipe(
    filterResultOk(),
    startWith([]),
    tag("THIS events$"),
    share()
  )

  const state$ = events$.pipe(
    map(() => State.ready),
    startWith(State.loading),
    distinctUntilChanged(),
    tag("state$"),
    shareLatest()
  )

  const props$ = combineLatest({
    state: state$,
    viewer: me$,
    events: events$,
  }).pipe(
    // // NOTE: block render until ready
    // switchMap(({ state, ...props }) =>
    //   state === State.loading ? EMPTY : of(props)
    // ),
    tag("props$"),
    shareLatest()
  )

  const react = props$.pipe(map((props) => h(View, { ...props, onClickNew })))

  const router = merge(newConvo$)

  return {
    react,
    router,
  }
}
