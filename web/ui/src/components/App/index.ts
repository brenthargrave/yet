import { h, ReactSource } from "@cycle/react"
import { combineLatest, of } from "rxjs"
import { map, share, switchMap } from "rxjs/operators"

import { View } from "./View"
import { Landing } from "~/components/Landing"

interface Sources {
  react: ReactSource
}
export const App = (rootSources: Sources) => {
  const sources = {
    // TODO: fake sources here
    ...rootSources,
  }
  const authenticated$ = of(false) // TODO: derive from graph?

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

  const react = combineLatest(authenticated$, landingView$).pipe(
    map(([authenticated, landing]) => {
      const childView = landing
      return h(View, [childView])
    }),
    share()
  )

  return {
    react,
  }
}
