import { h, ReactSource } from "@cycle/react"
import { combineLatest, of } from "rxjs"
import { map, share } from "rxjs/operators"
import { driver as router, isRoute, routes } from "~/router"

import { View as AppView } from "./View"
import { Landing } from "~/components/Landing"

interface Sources {
  react: ReactSource
}

export const App = (_sources: Sources) => {
  // NOTE: stub sources (eg, router) in lieu of drivers, pending:
  // https://github.com/cyclejs/cyclejs/pull/929
  const sources = {
    router,
    ..._sources,
  }
  const { history$ } = sources.router

  const { react: landingView$ } = Landing(sources)

  const react = combineLatest({
    route: history$,
    landing: landingView$,
  }).pipe(
    map(({ route, landing }) => {
      let childView
      // TODO: replace if/else w/ pattern-matching?
      if (isRoute(route, routes.home())) {
        childView = landing
      } else if (isRoute(route, routes.in())) {
        // TODO: auth view
        childView = null
      }
      return h(AppView, [childView])
    }),
    share()
  )

  return {
    react,
  }
}
