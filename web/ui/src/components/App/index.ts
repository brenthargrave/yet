import { h, ReactSource } from "@cycle/react"
import { of } from "rxjs"
import { h1 } from "@cycle/react-dom"

import { View } from "./View"

interface Sources {
  react: ReactSource
}
export const App = (sources: Sources) => {
  const authenticated$ = of(false)

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

  const react = of(h(View, [h1("Hello, world!")]))
  return {
    react,
  }
}
