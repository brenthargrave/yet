import { h, ReactSource } from "@cycle/react"
import { merge, mergeMap, of } from "rxjs"
import { Source as GraphSource } from "~/graph"
import { makeTagger } from "~/log"
import { isRoute, routes, Source as RouterSource } from "~/router"
import { View } from "./View"

const tag = makeTagger("Conversation/Edit")

interface Sources {
  react: ReactSource
  router: RouterSource
  graph: GraphSource
}

export const Edit = (sources: Sources) => {
  // const {
  //   router: { history$ },
  // } = sources

  // const { router: listRouter$, react: listView$, track } = List(sources)
  // const { react: editView$ } = Edit(sources)

  // const react = history$.pipe(
  //   mergeMap((route) =>
  //     isRoute(routes.createConversation(), route) ? editView$ : listView$
  //   )
  // )

  // const router = merge(listRouter$)
  const react = of(h(View))

  return {
    react,
    // router,
    // track,
  }
}
