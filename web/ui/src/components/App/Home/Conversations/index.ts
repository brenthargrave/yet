import { ReactSource } from "@cycle/react"
import { merge, switchMap } from "rxjs"
import { match } from "ts-pattern"
import { Source as GraphSource } from "~/graph"
import { routes, Source as RouterSource } from "~/router"
import { Main as Create } from "./Create"
import { Edit } from "./Edit"
import { List } from "./List"

interface Sources {
  react: ReactSource
  router: RouterSource
  graph: GraphSource
}

export const Conversations = (sources: Sources, tagPrefix?: string) => {
  const tagScope = `${tagPrefix}/Conversations`

  const {
    router: { history$ },
  } = sources

  const {
    router: listRouter$,
    react: listView$,
    track,
  } = List(sources, tagScope)

  const {
    react: editView$,
    router: editRouter$,
    notice,
  } = Edit(sources, tagScope)

  const { react: createView$, router: createRouter$ } = Create(
    sources,
    tagScope
  )

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
