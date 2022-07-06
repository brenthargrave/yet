import { h, ReactSource } from "@cycle/react"
import { map, merge, mergeMap, of, share, withLatestFrom } from "rxjs"
import { ulid } from "ulid"
import { EventName, Source as GraphSource, track$ } from "~/graph"
import { makeTagger } from "~/log"
import { push, routes, Source as RouterSource } from "~/router"
import { makeObservableCallback } from "~/rx"
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

  const { $: _clickNew$, cb: onClickNew } = makeObservableCallback()
  const clickNew$ = _clickNew$.pipe(tag("clickNew$"), share())
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

  const { $: _clickConversation$, cb: onClickConversation } =
    makeObservableCallback<string>()
  const clickConversation$ = _clickConversation$.pipe(
    tag("clickConversation$"),
    share()
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
