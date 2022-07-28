import { ReactSource } from "@cycle/react"
import { merge, switchMap, of } from "rxjs"
import { match } from "ts-pattern"
import { Source as GraphSource } from "~/graph"
import { routes, Source as RouterSource } from "~/router"
import { Main as Sign } from "../Sign"
import { Main as Show } from "../Show"

interface Sources {
  react: ReactSource
  router: RouterSource
  graph: GraphSource
}

export const Main = (sources: Sources, tagPrefix?: string) => {
  const tagScope = `${tagPrefix}/Single`

  const {
    router: { history$ },
  } = sources

  const sign = Sign(sources, tagScope)
  const show = Show(sources, tagScope)

  const react = history$.pipe(
    switchMap((route) =>
      match(route.name)
        .with(routes.signConversation.name, () => sign.react)
        .with(routes.conversation.name, () => show.react)
        .otherwise((_) => show.react)
    )
  )
  const router = merge(sign.router, show.router)
  const notice = merge(sign.notice, show.notice)

  return {
    react,
    router,
    notice,
  }
}
