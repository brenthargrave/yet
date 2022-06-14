import { ReactSource } from "@cycle/react"
import { merge } from "rxjs"
import { Source as GraphSource } from "~/graph"
import { makeTagger } from "~/log"
import { Source as RouterSource } from "~/router"
import { List } from "./List"

const tag = makeTagger("Conversations")

interface Sources {
  react: ReactSource
  router: RouterSource
  graph: GraphSource
}

export const Conversations = (sources: Sources) => {
  const { router: listRouter$, react, track } = List(sources)

  const router = merge(listRouter$)

  return {
    react,
    router,
    track,
  }
}
