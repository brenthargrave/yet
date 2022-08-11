import { ReactSource } from "@cycle/react"
import {
  Observable,
  startWith,
  EMPTY,
  merge,
  of,
  share,
  switchMap,
  map,
} from "rxjs"
import { match } from "ts-pattern"
import { Source as GraphSource } from "~/graph"
import { makeTagger } from "~/log"
import { routes, Source as RouterSource } from "~/router"
import { Main as Create } from "./Create"
import { Main as List } from "./List"

export enum State {
  list = "list",
  create = "create",
}

interface Sources {
  react: ReactSource
  router: RouterSource
  graph: GraphSource
}

export const Main = (sources: Sources, tagPrefix?: string) => {
  const tagScope = `${tagPrefix}/Opps`
  const tag = makeTagger(tagScope)

  const {
    router: { history$: _history$ },
  } = sources
  const history$ = _history$.pipe(tag("history$"), share())

  const list = List(sources, tagScope)
  const create = Create(sources, tagScope)

  const routerIntent$ = history$.pipe(
    map((route) =>
      match(route.name)
        .with(routes.newConversationOpps.name, () => State.list)
        .with(routes.newConversationNewOpp.name, () => State.create)
        .otherwise(() => State.list)
    ),
    startWith(State.list),
    tag("state$"),
    share()
  )

  const state$ = merge(routerIntent$, list.value.action)

  const react = state$.pipe(
    switchMap((state) =>
      match(state)
        .with(State.list, () => list.react)
        .with(State.create, () => create.react)
        .exhaustive()
    ),
    tag("react"),
    share()
  )

  const router = merge(list.router, create.router)
  const notice = merge(create.notice)

  return {
    react,
    router,
    notice,
  }
}
