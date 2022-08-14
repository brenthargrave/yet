import { ReactSource } from "@cycle/react"
import { distinctUntilChanged, map, merge, share, switchMap } from "rxjs"
import { match, P } from "ts-pattern"
import { Source as ActionSource } from "~/action"
import { Source as GraphSource } from "~/graph"
import { makeTagger } from "~/log"
import {
  singleConversationRoutesGroup,
  routes,
  Source as RouterSource,
  NEWID,
} from "~/router"
import { List } from "./List"
import { Main as Single } from "./Single"
import { Main as Create } from "./Single/Create"

enum State {
  list = "list",
  create = "create",
  single = "single",
}

interface Sources {
  react: ReactSource
  router: RouterSource
  graph: GraphSource
  action: ActionSource
}

export const Conversations = (sources: Sources, tagPrefix?: string) => {
  const tagScope = `${tagPrefix}/Conversations`
  const tag = makeTagger(tagScope)

  const {
    router: { history$ },
  } = sources

  const list = List(sources, tagScope)
  const create = Create(sources, tagScope)
  const single = Single(sources, tagScope)

  const state$ = history$.pipe(
    map((route) =>
      match(route)
        .with({ name: routes.conversations.name }, () => State.list)
        .when(singleConversationRoutesGroup.has, ({ params: { id } }) =>
          id === NEWID ? State.create : State.single
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
        .with(State.list, () => list.react)
        .with(State.create, () => create.react)
        .with(State.single, () => single.react)
        .exhaustive()
    ),
    tag("react"),
    share()
  )

  const track = merge(
    //
    list.track,
    create.track,
    single.track
  )
  const router = merge(
    //
    list.router,
    create.router,
    single.router
  )
  const notice = merge(
    //
    create.notice,
    single.notice
  )
  const graph = merge(
    //
    create.graph,
    single.graph
  )

  return {
    react,
    router,
    track,
    notice,
    graph,
  }
}
