import { h, ReactSource } from "@cycle/react"
import {
  combineLatest,
  distinctUntilChanged,
  EMPTY,
  filter,
  map,
  merge,
  mergeMap,
  share,
  startWith,
  switchMap,
  withLatestFrom,
} from "rxjs"
import { isNotNullish } from "rxjs-etc"
import { filterResultOk } from "ts-results/rxjs-operators"
import { Source as ActionSource } from "~/action"
import {
  Conversation,
  EventName,
  FromView,
  getTimeline$,
  Source as GraphSource,
  subscribeTimeline$,
  TimelineInput,
  track$,
} from "~/graph"
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
    graph: { me$: _me$, conversations$ },
  } = sources
  const me$ = _me$.pipe(
    //
    filter(isNotNullish),
    tag("me$"),
    shareLatest()
  )

  const [onClickNew, clickNew$] = cb$(tag("clickNew$"))
  const newConvo$ = clickNew$.pipe(
    map(() => push(routes.conversation({ id: NEWID }))),
    share()
  )
  const trackNewConvo$ = clickNew$.pipe(
    withLatestFrom(me$),
    mergeMap(([_, me]) =>
      track$({
        name: EventName.TapNewConversation,
        properties: {
          view: FromView.Timeline,
        },
        customerId: me?.id,
      })
    )
  )

  const [onClickConversation, clickConvo$] = cb$<Conversation>(tag("clickNew$"))
  const showConvo$ = clickConvo$.pipe(
    map(({ id }) => push(routes.conversation({ id })))
  )

  const result$ = history$.pipe(
    filter((route) => route.name === routes.root.name),
    withLatestFrom(me$),
    switchMap(([route, { id }]) => {
      const input: TimelineInput = { filters: { omitOwn: true } }
      const initial = getTimeline$(input)
      const live = subscribeTimeline$({ id }).pipe(
        switchMap((_) => getTimeline$(input))
      )
      return merge(initial, live)
    }),
    tag("result$"),
    share()
  )

  const events$ = result$.pipe(
    filterResultOk(),
    map((timeline) => timeline.events),
    startWith([]),
    tag("events$"),
    shareLatest()
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
    conversations: conversations$,
  }).pipe(tag("props$"), shareLatest())

  const react = props$.pipe(
    map((props) => h(View, { ...props, onClickNew, onClickConversation })),
    share()
  )

  const router = merge(newConvo$, showConvo$)
  const track = merge(trackNewConvo$)

  return {
    react,
    router,
    track,
  }
}
