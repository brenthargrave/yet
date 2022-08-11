import { ReactSource } from "@cycle/react"
import { distinctUntilChanged, map, merge, share, switchMap } from "rxjs"
import { match, P } from "ts-pattern"
import { Source as GraphSource } from "~/graph"
import { makeTagger } from "~/log"
import { routes, Source as RouterSource } from "~/router"
import { Main as Create } from "./Create"
import { Edit } from "./Edit"
import { List } from "./List"
import { Main as Single } from "./Single"

enum State {
  create = "create",
  edit = "edit",
  list = "list",
  single = "single",
}

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

  const state$ = history$.pipe(
    map((route) =>
      match(route.name)
        .with(
          P.union(
            routes.newConversation.name,
            routes.newConversationOpps.name,
            routes.newConversationNewOpp.name,
            routes.newConversationOpp.name
          ),
          () => State.create
        )
        .with(routes.editConversation.name, () => State.edit)
        .with(routes.conversations.name, () => State.list)
        .with(
          P.union(routes.signConversation.name, routes.conversation.name),
          () => State.single
        )
        .otherwise(() => State.list)
    ),
    distinctUntilChanged(),
    tag("state$"),
    share()
  )

  const react = state$.pipe(
    switchMap((state) =>
      match(state)
        .with(State.create, () => create.react)
        .with(State.edit, () => edit.react)
        .with(State.list, () => list.react)
        .with(State.single, () => single.react)
        .exhaustive()
    ),
    tag("react"),
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
