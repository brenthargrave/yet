import { h, ReactSource } from "@cycle/react"
import { of } from "rxjs"
import { Source as RouterSource } from "~/router"
import { makeObservableCallback } from "~/rx"
import { View, Conversation } from "./View"

interface Sources {
  react: ReactSource
  router: RouterSource
}

export const Conversations = (sources: Sources) => {
  const [clickedNew$, onClickNew] = makeObservableCallback()
  const conversations: Conversation[] = [] // TODO: where derived from?
  const react = of(h(View, { conversations, onClickNew }))

  return {
    react,
  }
}
