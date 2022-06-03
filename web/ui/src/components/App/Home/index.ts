import { h, ReactSource } from "@cycle/react"
import { map, of } from "rxjs"
import { Source as RouterSource } from "~/router"
import { Conversations } from "./Conversations"
import { View } from "./View"

interface Sources {
  react: ReactSource
  router: RouterSource
}

export const Home = (sources: Sources) => {
  const conversations = Conversations(sources)

  const react = conversations.react.pipe(map((subview) => h(View, [subview])))

  return {
    react,
  }
}
