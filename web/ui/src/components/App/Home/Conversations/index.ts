import { ReactSource } from "@cycle/react"
import { merge, mergeMap } from "rxjs"
import { Source as GraphSource } from "~/graph"
import { makeTagger } from "~/log"
import { isRoute, routes, Source as RouterSource } from "~/router"
import { List } from "./List"
import { Edit } from "./Edit"

const tag = makeTagger("Conversation")

interface Sources {
  react: ReactSource
  router: RouterSource
  graph: GraphSource
}

export const Conversations = (sources: Sources) => {
  const {
    router: { history$ },
  } = sources

  const {
    router: listRouter$,
    react: listView$,
    track,
    ...list
  } = List(sources)
  const { react: editView$, ...edit } = Edit(sources)

  const react = history$.pipe(
    mergeMap((route) =>
      isRoute(routes.createConversation(), route) ? editView$ : listView$
    )
  )

  // TODO: const router = mergeSinks("router", [list, edit]) // listRouter$)
  const router = merge(listRouter$)

  return {
    react,
    router,
    track,
  }
}
