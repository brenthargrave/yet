import { h, ReactSource } from "@cycle/react"
import { combineLatest, map, merge, mergeMap, withLatestFrom } from "rxjs"
import {
  Conversation,
  EventName,
  isCreatedBy,
  Source as GraphSource,
  track$,
} from "~/graph"
import { makeTagger } from "~/log"
import { push, routes, Source as RouterSource } from "~/router"
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

  const [onClickNew, clickNew$] = cb$(tag("clickNew$"))

  const newConvo$ = clickNew$.pipe(mapTo(push(routes.newConversation())))

  const track = clickNew$.pipe(
    withLatestFrom(me$),
    mergeMap(([_, me]) =>
      track$({
        name: EventName.TapNewConversation,
        properties: {},
        userId: me?.id,
      })
    )
  )

  const [onClickConversation, clickConvo$] = cb$<Conversation>(
    tag("clickConvo$")
  )

  const editConvo$ = clickConvo$.pipe(
    withLatestFrom(me$),
    map(([conversation, me]) => {
      const route = isCreatedBy(conversation, me)
        ? routes.editConversation({ id: conversation.id })
        : routes.conversation({ id: conversation.id })
      return push(route)
    })
  )

  const react = conversations$.pipe(
    map((conversations) =>
      h(View, { conversations, onClickNew, onClickConversation })
    )
  )

  const router = merge(newConvo$, editConvo$)

  return {
    react,
    router,
    track,
  }
}
