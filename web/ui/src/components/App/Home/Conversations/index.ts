import { h, ReactSource } from "@cycle/react"
import { merge, EMPTY, map, mergeMap, of, share, withLatestFrom } from "rxjs"
import { Source as RouterSource, routes } from "~/router"
import { makeObservableCallback } from "~/rx"
import { makeTagger } from "~/log"
import { View, Conversation } from "./View"
import { EventName, track$, Source as GraphSource, isOnboard } from "~/graph"

const tag = makeTagger("Conversations")

interface Sources {
  react: ReactSource
  router: RouterSource
  graph: GraphSource
}

export const Conversations = (sources: Sources) => {
  const {
    router: { history$ },
    graph: { me$ },
  } = sources
  // TODO: refactor into helper
  const redirect$ = history$.pipe(
    withLatestFrom(me$),
    mergeMap(([route, me]) => (isOnboard(me) ? EMPTY : of(routes.root())))
  )

  const [_clickNew$, onClickNew] = makeObservableCallback()
  const clickNew$ = _clickNew$.pipe(tag("clickNew$"), share())
  const newConvo$ = clickNew$.pipe(map((_) => routes.createConversation()))
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

  const router = merge(redirect$, newConvo$)

  return {
    react,
    router,
    track,
  }
}
