import { ReactSource } from "@cycle/react"
import { EMPTY, merge, share, switchMap } from "rxjs"
import { match } from "ts-pattern"
import { Source as GraphSource } from "~/graph"
import { makeTagger } from "~/log"
import { routes, Source as RouterSource } from "~/router"
import { Main as Create } from "./Create"
import { Main as List } from "./List"

interface Sources {
  react: ReactSource
  router: RouterSource
  graph: GraphSource
}

export const Main = (sources: Sources, tagPrefix?: string) => {
  const tagScope = `${tagPrefix}/Opps`
  const tag = makeTagger(tagScope)

  const {
    router: { history$ },
  } = sources

  const list = List(sources, tagScope)
  const create = Create(sources, tagScope)

  const react = history$.pipe(
    switchMap((route) =>
      match(route.name)
        .with(routes.newConversationOpps.name, () => list.react)
        .with(routes.newConversationNewOpp.name, () => create.react)
        .otherwise(() => EMPTY)
    ),
    tag("react"),
    share()
  )

  const router = merge(list.router)
  return {
    react,
    router,
  }
}
