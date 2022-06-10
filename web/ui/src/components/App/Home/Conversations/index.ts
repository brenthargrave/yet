import { h, ReactSource } from "@cycle/react"
import { map, of, share } from "rxjs"
import { Source as RouterSource, routes } from "~/router"
import { makeObservableCallback } from "~/rx"
import { makeTagger } from "~/log"
import { View, Conversation } from "./View"

const tag = makeTagger("Conversations")

interface Sources {
  react: ReactSource
  router: RouterSource
}

export const Conversations = (sources: Sources) => {
  const [_clickNew$, onClickNew] = makeObservableCallback()
  const clickNew$ = _clickNew$.pipe(tag("clickNew$"), share())

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

  // const router = clickNew$.pipe(map(_ => routes.TODO))

  return {
    react,
  }
}
