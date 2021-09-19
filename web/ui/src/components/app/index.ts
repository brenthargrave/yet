import { h, ReactSource } from "@cycle/react"
import { of } from "rxjs"

import { view } from "./view"

// @ts-ignore
const { VITE_API_ENV } = import.meta.env
console.log(`API_ENV: ${VITE_API_ENV}`)

interface Sources {
  react: ReactSource
}

export const App = (_sources: Sources) => {
  const react = of(h(view))
  return {
    react,
  }
}
