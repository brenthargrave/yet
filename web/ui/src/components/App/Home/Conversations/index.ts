import { h } from "@cycle/react"
import { of } from "rxjs"
import { CC, Sources } from "~/components/App"
import { makeObservableCallback } from "~/rx"
import { Conversation, View } from "./View"

export const Conversations: CC<Sources> = (sources) => {
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
