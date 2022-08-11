import { ReactSource } from "@cycle/react"
import {
  merge,
  switchMap,
  share,
  distinctUntilChanged,
  distinctUntilKeyChanged,
} from "rxjs"
import { match, P } from "ts-pattern"
import { Source as GraphSource } from "~/graph"
import { routes, Source as RouterSource } from "~/router"
import { Main as Create } from "./Create"
import { Edit } from "./Edit"
import { List } from "./List"
import { Main as Single } from "./Single"
import { makeTagger } from "~/log"

interface Sources {
  react: ReactSource
  router: RouterSource
  graph: GraphSource
}

export const Conversations = (sources: Sources, tagPrefix?: string) => {
  const tagScope = `${tagPrefix}/Conversations`
  const tag = makeTagger(tagScope)

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
        .with(
          P.union(
            routes.newConversation.name,
            routes.newConversationOpps.name,
            routes.newConversationNewOpp.name,
            routes.newConversationOpp.name
          ),
          () => create.react
        )
        .with(routes.editConversation.name, () => edit.react)
        .with(routes.conversations.name, () => list.react)
        .with(
          P.union(routes.signConversation.name, routes.conversation.name),
          () => single.react
        )
        .otherwise(() => list.react)
    ),
    share()
  )

  const track = merge(list.track, edit.track, create.track, single.track)
  const router = merge(list.router, edit.router, create.router, single.router)
  const notice = merge(edit.notice, create.notice, single.notice)
  const graph = merge(create.graph, edit.graph)

  return {
    react,
    router,
    track,
    notice,
    graph,
  }
}
