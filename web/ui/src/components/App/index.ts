import { h, ReactSource } from "@cycle/react"
import { of } from "rxjs"
import { h1 } from "@cycle/react-dom"

import { View } from "./View"

interface Sources {
  react: ReactSource
}
export const App = (sources: Sources) => {
  // TODO
  // const { history$ } = sources.router
  // const react = history$.pipe(
  //   flatMap((route) => {
  //     h(View, { route })
  //   })
  // )
  const react = of(h(View, [h1("Hello, world!")]))
  return {
    react,
  }
}
