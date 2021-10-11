import { h, ReactSource } from "@cycle/react"
import { combineLatest, of } from "rxjs"
import { map, share, switchMap } from "rxjs/operators"
import { driver as router, isRoute, routes } from "~/router"

import { View } from "./View"
import { Landing } from "~/components/Landing"

interface Sources {
  react: ReactSource
}
export const App = (_sources: Sources) => {
  // NOTE: stub sources in lieu of drivers
  const sources = {
    router,
    ..._sources,
  }
  const { history$ } = sources.router

  // TODO
  // ¿how choose which components appears first?
  // if authenticated, Home
  // Home = Auth || Onboarding || ? Search Results?
  // else Landing()

  const { react: landingView$ } = Landing(sources)

  const react = history$.pipe(
    switchMap((route) => {
      return landingView$.pipe(
        // TODO
        map((childView) => h(View, [childView]))
      )
    }),
    share()
  )

  return {
    react,
  }
}
