import { ReactSource } from "@cycle/react"
import {
  distinctUntilChanged,
  map,
  merge,
  share,
  startWith,
  switchMap,
} from "rxjs"
import { match } from "ts-pattern"
import { Source as GraphSource } from "~/graph"
import { makeTagger } from "~/log"
import { routes, Source as RouterSource } from "~/router"
import { Main as Create } from "./Create"
import { Main as Edit } from "./Edit"
import { Main as List } from "./List"

export enum State {
  list = "list",
  create = "create",
  edit = "edit",
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
  const edit = Edit(sources, tagScope)
  // TODO: edit vs. show based on viewer

  const routerIntent$ = history$.pipe(
    map((route) =>
      match(route.name)
        .with(routes.newConversationOpps.name, () => State.list)
        .with(routes.newConversationNewOpp.name, () => State.create)
        .with(routes.newConversationOpp.name, () => State.edit)
        .otherwise(() => State.list)
    ),
    startWith(State.list),
    distinctUntilChanged(),
    tag("routerIntent$"),
    share()
  )

  const state$ = merge(routerIntent$).pipe(
    distinctUntilChanged(),
    tag("state$"),
    share()
  )

  const react = state$.pipe(
    switchMap((state) =>
      match(state)
        .with(State.list, () => list.react)
        .with(State.create, () => create.react)
        .with(State.edit, () => edit.react)
        .exhaustive()
    ),
    tag("react"),
    share()
  )

  const router = merge(list.router, create.router, edit.router)
  const notice = merge(create.notice, edit.notice)
  const value = { ...list.value }

  return {
    react,
    router,
    notice,
    value,
  }
}
