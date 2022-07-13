import { h, ReactSource } from "@cycle/react"
import { map, merge, mergeMap, withLatestFrom } from "rxjs"
import { EventName, Source as GraphSource, track$ } from "~/graph"
import { makeTagger } from "~/log"
import { push, routes, Source as RouterSource } from "~/router"
import { callback$ } from "~/rx"
import { View } from "./View"

const tag = makeTagger("Conversations/List")

interface Sources {
  react: ReactSource
  router: RouterSource
  graph: GraphSource
}
export const List = (sources: Sources) => {
  const {
    router: { history$ },
    graph: { me$, conversations$ },
  } = sources

  const { $: clickNew$, cb: onClickNew } = callback$(tag("clickNew$"))

  const newConvo$ = clickNew$.pipe(map((_) => push(routes.newConversation())))

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

  const { $: clickConversation$, cb: onClickConversation } = callback$<string>(
    tag("clickConversation$")
  )

  const editConvo$ = clickConversation$.pipe(
    map((id) => push(routes.editConversation({ id })))
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
