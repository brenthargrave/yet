import { h, ReactSource } from "@cycle/react"
import { of } from "rxjs"

import { view } from "./view"

interface Sources {
  react: ReactSource
}

export const App = (_sources: Sources) => {
  const react = of(h(view))
  return {
    react,
  }
}
