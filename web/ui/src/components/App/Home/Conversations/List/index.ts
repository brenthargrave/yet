import { h, ReactSource } from "@cycle/react"
import {
  combineLatest,
  filter,
  map,
  merge,
  mergeMap,
  share,
  withLatestFrom,
} from "rxjs"
import {
  Conversation,
  EventName,
  isLurking,
  Source as GraphSource,
  track$,
} from "~/graph"
import { makeTagger } from "~/log"
import { NEWID, push, routes, Source as RouterSource } from "~/router"
import { cb$, mapTo } from "~/rx"
import { View } from "./View"

interface Sources {
  react: ReactSource
  router: RouterSource
  graph: GraphSource
}
export const List = (sources: Sources, tagPrefix?: string) => {
  const {
    router: { history$ },
    graph: { me$, conversations$ },
  } = sources
  const tag = makeTagger(`${tagPrefix}/List`)

  const redirectLurkerToRoot$ = combineLatest({
    route: history$,
    me: me$,
  }).pipe(
    filter(
      ({ route, me }) =>
        route.name === routes.conversations.name && isLurking(me)
    ),
    mapTo(push(routes.root())),
    tag("redirectLurkerToRoot$"),
    share()
  )

  const [onClickNew, clickNew$] = cb$(tag("clickNew$"))

  const newConvo$ = clickNew$.pipe(
    mapTo(push(routes.conversation({ id: NEWID })))
  )

  const track = clickNew$.pipe(
    withLatestFrom(me$),
    mergeMap(([_, me]) =>
      track$({
        name: EventName.TapNewConversation,
        properties: {
          signatureCount: me?.stats?.signatureCount,
        },
        customerId: me?.id,
      })
    )
  )

  const [onClickConversation, onClickConversation$] = cb$<Conversation>(
    tag("clickConvo$")
  )

  const editConvo$ = onClickConversation$.pipe(
    map(({ id }) => push(routes.conversation({ id }))),
    tag("editConvo$"),
    share()
  )

  const props$ = combineLatest({ viewer: me$, conversations: conversations$ })
  const react = props$.pipe(
    map(({ viewer, conversations }) =>
      h(View, { viewer, conversations, onClickNew, onClickConversation })
    ),
    tag("react")
  )

  const router = merge(newConvo$, editConvo$, redirectLurkerToRoot$)

  return {
    react,
    router,
    track,
  }
}
