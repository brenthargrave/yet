import { h, ReactSource } from "@cycle/react"
import { combineLatest, of } from "rxjs"
import { map, share } from "rxjs/operators"
import { driver as router, isRoute } from "~/router"

import { View } from "./View"
import { Landing } from "~/components/Landing"

interface Sources {
  react: ReactSource
}
export const App = (rootSources: Sources) => {
  // NOTE: stub sources in lieu of drivers
  const sources = {
    router,
    ...rootSources,
  }
  const { history$ } = sources.router

  // TODO
  // const { history$ } = sources.router
  // const react = history$.pipe(
  //   flatMap((route) => {
  //     h(View, { route })
  //   })
  // )
  /**
   *  ¿how choose which components appears first?
   */

  // if authenticated, Home
  // Home = Auth || Onboarding || ? Search Results?
  // else Landing()

  const { react: landingView$ } = Landing(sources)

  const react = combineLatest(history$, landingView$).pipe(
    map(([route, landing]) => {
      const childView = landing
      return h(View, [childView])
    }),
    share()
  )

  return {
    react,
  }
}
