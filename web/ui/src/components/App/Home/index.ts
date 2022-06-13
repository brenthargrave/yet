import { h, ReactSource } from "@cycle/react"
import { map, of } from "rxjs"
import { Source as RouterSource } from "~/router"
import { Conversations } from "./Conversations"
import { View } from "./View"
import { Source as GraphSource } from "~/graph"

interface Sources {
  react: ReactSource
  router: RouterSource
  graph: GraphSource
}

export const Home = (sources: Sources) => {
  const {
    react: conversationsView$,
    router,
    track,
    ...converstions
  } = Conversations(sources)

  const react = conversationsView$.pipe(map((subview) => h(View, [subview])))

  return {
    react,
    router,
    track,
  }
}
