import { h, ReactSource } from "@cycle/react"
import {
  combineLatest,
  EMPTY,
  filter,
  map,
  merge,
  of,
  share,
  switchMap,
} from "rxjs"
import { isNotNullish } from "rxjs-etc"
import { match } from "ts-pattern"
import { Source as ActionSource } from "~/action"
import {
  EventName,
  NotificationChannel,
  NotificationKind,
  Source as GraphSource,
  track$,
  unsubscribe$,
} from "~/graph"
import { makeTagger } from "~/log"
import { push, routes, Source as RouterSource } from "~/router"
import { cb$, shareLatest } from "~/rx"
import { View, State } from "./View"

export interface Sources {
  react: ReactSource
  router: RouterSource
  graph: GraphSource
  action: ActionSource
}

export const Unsubscribe = (sources: Sources, tagPrefix?: string) => {
  const tagScope = `${tagPrefix}/Unsubscribe`
  const tag = makeTagger(tagScope)

  const {
    router: { history$ },
    graph: { me$ },
  } = sources

  const id$ = history$.pipe(
    switchMap((route) =>
      match(route)
        .with({ name: routes.unsubscribeDigest.name }, ({ params: { id } }) =>
          of(id)
        )
        .otherwise(() => EMPTY)
    ),
    filter(isNotNullish),
    tag("id$"),
    shareLatest()
  )

  const result$ = id$.pipe(
    switchMap((customerId) => unsubscribe$({ customerId })),
    tag("result$")
  )

  const state$ = merge(
    id$.pipe(map((_) => State.loading)),
    result$.pipe(map((_) => State.loaded))
  ).pipe(tag("state$"), shareLatest())

  const trackUnsubscribe$ = id$.pipe(
    switchMap((id) =>
      track$({
        name: EventName.UnsubscribeNotification,
        customerId: id,
        properties: {
          notificationChannel: NotificationChannel.Email,
          notificationKind: NotificationKind.Digest,
        },
      })
    ),
    tag("trackUnsubscribe$"),
    share()
  )

  const [onClickHome, clickHome$] = cb$(tag("clickHome$"))
  const goHome$ = clickHome$.pipe(map(() => push(routes.root())))

  const props$ = combineLatest({
    state: state$,
    result: result$,
  }).pipe(tag("props$"), shareLatest())

  const react = props$.pipe(map((props) => h(View, { ...props, onClickHome })))
  const router = merge(goHome$)
  const track = merge(trackUnsubscribe$)

  return {
    react,
    router,
    track,
  }
}
