import { h, ReactSource } from "@cycle/react"
import { map, of, share } from "rxjs"
import { Source as RouterSource, routes } from "~/router"
import { makeObservableCallback } from "~/rx"
import { makeTagger } from "~/log"
import { View, Conversation } from "./View"
import { EventName, track$ } from "~/graph"

const tag = makeTagger("Conversations")

interface Sources {
  react: ReactSource
  router: RouterSource
}

export const Conversations = (sources: Sources) => {
  const [_clickNew$, onClickNew] = makeObservableCallback()
  const clickNew$ = _clickNew$.pipe(tag("clickNew$"), share())
  const router = clickNew$.pipe(map((_) => routes.createConversation()))
  // const track = clickNew$.pipe(
  //   map((_) =>
  //     track$({
  //       properties: {},
  //       // name: EventName.TapNoteNewConversation
  //       // ! you still haven't decided on naming this shit!
  //     })
  //   )
  // )

  const conversations: Conversation[] = []

  const react = of(h(View, { conversations, onClickNew }))

  return {
    react,
    // router,
    // track
  }
}
