import { h, ReactSource } from "@cycle/react"
import {
  combineLatest,
  distinctUntilChanged,
  filter,
  map,
  merge,
  share,
  startWith,
  switchMap,
} from "rxjs"
import { isNotNullish } from "rxjs-etc"
import { filterResultOk } from "ts-results/rxjs-operators"
import { Source as ActionSource } from "~/action"
import {
  Conversation,
  getTimeline$,
  Source as GraphSource,
  subscribeTimeline$,
} from "~/graph"
import { makeTagger } from "~/log"
import { NEWID, push, routes } from "~/router"
import { cb$, shareLatest } from "~/rx"
import { State, View } from "./View"

export interface Sources {
  react: ReactSource
  graph: GraphSource
  action: ActionSource
}

export const Timeline = (sources: Sources, tagPrefix?: string) => {
  const tagScope = `${tagPrefix}/Timeline`
  const tag = makeTagger(tagScope)

  const {
    graph: { me$ },
  } = sources

  const [onClickNew, clickNew$] = cb$(tag("clickNew$"))
  const newConvo$ = clickNew$.pipe(
    map(() => push(routes.conversation({ id: NEWID })))
  )

  const [onClickConversation, clickConvo$] = cb$<Conversation>(tag("clickNew$"))
  const showConvo$ = clickConvo$.pipe(
    map(({ id }) => push(routes.conversation({ id })))
  )

  const result$ = getTimeline$().pipe(tag("result$"), share())

  const initiaLevents$ = result$.pipe(
    filterResultOk(),
    startWith([]),
    tag("THIS events$"),
    share()
  )

  const newEvents$ = me$.pipe(
    filter(isNotNullish),
    switchMap(({ id }) => subscribeTimeline$({ id })),
    tag("newEvents$"),
    shareLatest()
  )

  const events$ = merge(
    initiaLevents$,
    newEvents$.pipe(
      switchMap(() => getTimeline$()),
      filterResultOk(),
      tag("newEvents$ -> refetched"),
      shareLatest()
    )
  )

  const state$ = initiaLevents$.pipe(
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
  }).pipe(tag("props$"), shareLatest())

  const react = props$.pipe(
    map((props) => h(View, { ...props, onClickNew, onClickConversation }))
  )

  const router = merge(newConvo$, showConvo$)

  return {
    react,
    router,
  }
}
