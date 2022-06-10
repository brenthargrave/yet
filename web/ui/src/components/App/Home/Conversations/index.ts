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

  const conversations: Conversation[] = []

  const react = of(h(View, { conversations, onClickNew }))

  // const router = clickNew$.pipe(map(_ => routes.conversation({ cid: TODO })))
  // TODO: really want to be generating ulids inside every component? smells

  return {
    react,
  }
}
