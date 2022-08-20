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
import { shareLatest } from "~/rx"
import { List } from "./List"
import { Single } from "./Single"
import { pluck } from "~/fp"

export enum State {
  list = "list",
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

  const state$ = history$.pipe(
    map((route) =>
      match(route)
        .with({ name: routes.conversations.name }, () => State.list)
        .when(singleConversationRoutesGroup.has, () => State.single)
        .otherwise(() => State.list)
    ),
    distinctUntilChanged(),
    tag("state$"),
    shareLatest()
  )

  const list = List(sources, tagScope)
  const single = Single(sources, tagScope)

  const react = state$.pipe(
    switchMap((state) =>
      match(state)
        .with(State.list, () => list.react)
        .with(State.single, () => single.react)
        .exhaustive()
    ),
    tag("react"),
    share()
  )

  const track = merge(...pluck("track", [list, single]))
  const router = merge(...pluck("router", [list, single]))
  const notice = merge(...pluck("notice", [single]))
  const graph = merge(...pluck("graph", [single]))

  return {
    react,
    router,
    track,
    notice,
    graph,
  }
}
