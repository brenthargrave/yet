import { h, ReactSource } from "@cycle/react"
import { of } from "rxjs"

import { view } from "./view"

// @ts-ignore
// const { API_ENV } = import.meta.env
console.log(import.meta.env)

interface Sources {
  react: ReactSource
}

export const App = (_sources: Sources) => {
  const react = of(h(view))
  return {
    react,
  }
}
