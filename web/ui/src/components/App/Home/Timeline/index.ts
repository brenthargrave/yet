import { h, ReactSource } from "@cycle/react"
import {
  combineLatest,
  distinctUntilChanged,
  EMPTY,
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
import { Conversation, getTimeline$, Source as GraphSource } from "~/graph"
import { makeTagger } from "~/log"
import { NEWID, push, routes, Source as RouterSource } from "~/router"
import { cb$, shareLatest } from "~/rx"
import { State, View } from "./View"

export interface Sources {
  react: ReactSource
  router: RouterSource
  graph: GraphSource
  action: ActionSource
}

export const Timeline = (sources: Sources, tagPrefix?: string) => {
  const tagScope = `${tagPrefix}/Timeline`
  const tag = makeTagger(tagScope)

  const {
    router: { history$ },
    graph: { me$: _me$ },
  } = sources
  const me$ = _me$.pipe(filter(isNotNullish), tag("me$"))

  const [onClickNew, clickNew$] = cb$(tag("clickNew$"))
  const newConvo$ = clickNew$.pipe(
    map(() => push(routes.conversation({ id: NEWID })))
  )

  const [onClickConversation, clickConvo$] = cb$<Conversation>(tag("clickNew$"))
  const showConvo$ = clickConvo$.pipe(
    map(({ id }) => push(routes.conversation({ id })))
  )

  const result$ = history$.pipe(
    switchMap((route) =>
      route.name === routes.root.name
        ? getTimeline$({ filters: { omitOwn: true } })
        : EMPTY
    ),
    tag("result$"),
    shareLatest()
  )

  const events$ = result$.pipe(
    filterResultOk(),
    startWith([]),
    tag("events$"),
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
