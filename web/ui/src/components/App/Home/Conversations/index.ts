import { ReactSource } from "@cycle/react"
import { merge, switchMap } from "rxjs"
import { match, P } from "ts-pattern"
import { Source as GraphSource } from "~/graph"
import { routes, Source as RouterSource } from "~/router"
import { Main as Create } from "./Create"
import { Edit } from "./Edit"
import { List } from "./List"
import { Main as Single } from "./Single"

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

  const list = List(sources, tagScope)
  const single = Single(sources, tagScope)

  const edit = Edit(sources, tagScope)
  const create = Create(sources, tagScope)

  const react = history$.pipe(
    switchMap((route) =>
      match(route.name)
        .with(routes.newConversation.name, () => create.react)
        .with(routes.editConversation.name, () => edit.react)
        .with(routes.conversations.name, () => list.react)
        .with(
          P.union(routes.signConversation.name, routes.conversation.name),
          () => single.react
        )
        .otherwise((_) => list.react)
    )
  )

  const { track } = list
  const router = merge(list.router, edit.router, create.router)
  const notice = merge(edit.notice)

  return {
    react,
    router,
    track,
    notice,
  }
}
