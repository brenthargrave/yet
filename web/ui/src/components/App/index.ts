import { h, ReactSource } from "@cycle/react"
import { combineLatest, of } from "rxjs"
import { map, share } from "rxjs/operators"
import { h1 } from "@cycle/react-dom"

import { View } from "./View"

interface Sources {
  react: ReactSource
}
export const App = (sources: Sources) => {
  const authenticated$ = of(false) // TODO: auth state?

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

  const react = combineLatest([authenticated$]).pipe(
    map(([authenticated]) => {
      return h(View, [h1("Hello, world!")])
    }),
    share()
  )

  return {
    react,
  }
}
