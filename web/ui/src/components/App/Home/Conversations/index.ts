import { h, ReactSource } from "@cycle/react"
import { map, of, share, withLatestFrom } from "rxjs"
import { Source as RouterSource, routes } from "~/router"
import { makeObservableCallback } from "~/rx"
import { makeTagger } from "~/log"
import { View, Conversation } from "./View"
import { EventName, track$, Source as GraphSource } from "~/graph"

const tag = makeTagger("Conversations")

interface Sources {
  react: ReactSource
  router: RouterSource
  graph: GraphSource
}

export const Conversations = (sources: Sources) => {
  const { me$ } = sources.graph

  const [_clickNew$, onClickNew] = makeObservableCallback()
  const clickNew$ = _clickNew$.pipe(tag("clickNew$"), share())
  const router = clickNew$.pipe(map((_) => routes.createConversation()))
  const track = clickNew$.pipe(
    withLatestFrom(me$),
    map(([_, me]) =>
      track$({
        name: EventName.TapNewConversation,
        properties: {},
        userId: me?.id,
      })
    )
  )

  const conversations: Conversation[] = []

  const react = of(h(View, { conversations, onClickNew }))

  return {
    react,
    router,
    // track
  }
}
