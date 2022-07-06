import { ReactSource } from "@cycle/react"
import { merge, switchMap } from "rxjs"
import { match } from "ts-pattern"
import { Source as GraphSource } from "~/graph"
import { makeTagger } from "~/log"
import { routes, Source as RouterSource } from "~/router"
import { Edit } from "./Edit"
import { List } from "./List"
import { Main as Create } from "./Create"

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

  const { react: editView$, router: editRouter$, notice } = Edit(sources)

  const { react: createView$, router: createRouter$ } = Create(sources)

  const react = history$.pipe(
    switchMap((route) =>
      match(route.name)
        .with(routes.newConversation.name, () => createView$)
        .with(routes.editConversation.name, () => editView$)
        .with(routes.conversations.name, () => listView$)
        .otherwise((_) => listView$)
    )
  )

  const router = merge(listRouter$, editRouter$, createRouter$)

  return {
    react,
    router,
    track,
    notice,
  }
}
