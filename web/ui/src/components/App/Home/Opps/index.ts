import { ReactSource } from "@cycle/react"
import { merge, share, startWith, switchMap } from "rxjs"
import { match } from "ts-pattern"
import { Source as GraphSource } from "~/graph"
import { makeTagger } from "~/log"
import { Source as RouterSource } from "~/router"
import { shareLatest } from "~/rx"
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

  const list = List(sources, tagScope)
  const create = Create(sources, tagScope)

  const state$ = merge(list.value.intent$).pipe(
    startWith(State.list),
    tag("state$"),
    shareLatest()
  )

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

  return {
    react,
  }
}
