import { h, ReactSource } from "@cycle/react"
import { map, merge, mergeMap, of, share, withLatestFrom } from "rxjs"
import { ulid } from "ulid"
import { EventName, Source as GraphSource, track$ } from "~/graph"
import { makeTagger } from "~/log"
import { push, routes, Source as RouterSource } from "~/router"
import { makeObservableCallback } from "~/rx"
import { Conversation, View } from "./View"

const tag = makeTagger("Conversation/List")

interface Sources {
  react: ReactSource
  router: RouterSource
  graph: GraphSource
}
export const List = (sources: Sources) => {
  const {
    router: { history$ },
    graph: { me$ },
  } = sources

  const { $: _clickNew$, cb: onClickNew } = makeObservableCallback()
  const clickNew$ = _clickNew$.pipe(tag("clickNew$"), share())
  const newConvo$ = clickNew$.pipe(
    map((_) => push(routes.editConversation({ id: ulid() })))
  )
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

  const conversations: Conversation[] = []
  const react = of(h(View, { conversations, onClickNew }))
  const router = merge(newConvo$)

  return {
    react,
    router,
    track,
  }
}
