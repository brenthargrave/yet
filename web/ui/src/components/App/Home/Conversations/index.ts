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
  const [click$, onClickNew] = makeObservableCallback()
  // TODO
  /**
   * how to handle new converations?
   * URL: fml
   * this should'nt be this hard!
   * a notion of actions might actually be helpful..
   * action$ = click.map createConversation(ulid)
   */
  const conversations: Conversation[] = []
  const react = of(h(View, { conversations, onClickNew }))

  return {
    react,
  }
}
