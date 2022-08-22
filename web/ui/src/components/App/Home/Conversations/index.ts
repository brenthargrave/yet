import { ReactSource } from "@cycle/react"
import { distinctUntilChanged, map, merge, share, switchMap } from "rxjs"
import { equals } from "rxjs-etc/dist/esm/operators"
import { match } from "ts-pattern"
import { Source as ActionSource } from "~/action"
import { pluck } from "~/fp"
import { Source as GraphSource } from "~/graph"
import { makeTagger } from "~/log"
import {
  NEWID,
  routes,
  singleConversationRoutesGroup,
  Source as RouterSource,
} from "~/router"
import { shareLatest } from "~/rx"
import { List } from "./List"
import { Single } from "./Single"
import { Create } from "./Single/Create"

export enum State {
  list = "list",
  single = "single",
  create = "create",
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
    shareLatest()
  )

  const list = List(sources, tagScope)
  const single = Single(sources, tagScope)
  const create = Create(
    { ...sources, props: { reset$: state$.pipe(equals(State.create)) } },
    tagScope
  )

  const react = state$.pipe(
    switchMap((state) =>
      match(state)
        .with(State.list, () => list.react)
        .with(State.single, () => single.react)
        .with(State.create, () => create.react)
        .exhaustive()
    ),
    tag("react"),
    share()
  )

  const router = merge(...pluck("router", [list, single, create]))
  const notice = merge(...pluck("notice", [single, create]))
  const track = merge(...pluck("track", [list, single, create]))
  const graph = merge(...pluck("graph", [single, create]))

  return {
    react,
    router,
    track,
    notice,
    graph,
  }
}
