import { ReactSource } from "@cycle/react"
import { merge, switchMap } from "rxjs"
import { match } from "ts-pattern"
import { Source as GraphSource } from "~/graph"
import { routes, Source as RouterSource } from "~/router"
import { Main as Create } from "./Create"
import { Edit } from "./Edit"
import { List } from "./List"
import { Sign } from "./Sign"
import { Show } from "./Show"

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
  const edit = Edit(sources, tagScope)
  const create = Create(sources, tagScope)
  const sign = Sign(sources, tagScope)
  const show = Show(sources, tagScope)

  const react = history$.pipe(
    switchMap((route) =>
      match(route.name)
        .with(routes.newConversation.name, () => create.react)
        .with(routes.editConversation.name, () => edit.react)
        .with(routes.conversations.name, () => list.react)
        .with(routes.signConversation.name, () => sign.react)
        .with(routes.conversation.name, () => show.react)
        .otherwise((_) => list.react)
    )
  )

  const { track } = list
  const router = merge(list.router, edit.router, create.router, sign.router)
  const notice = merge(edit.notice, sign.notice)

  return {
    react,
    router,
    track,
    notice,
  }
}
