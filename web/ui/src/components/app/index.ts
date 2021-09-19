import { h, ReactSource } from "@cycle/react"
import { h1 } from "@cycle/react-dom"
import { of } from "rxjs"

import { view } from "./view"

const { VITE_API_ENV } = import.meta.env
console.log(`API_ENV: ${VITE_API_ENV}`)

interface Sources {
  react: ReactSource
}

export const App = (_sources: Sources) => {
  const react = of(h(view))
  // const react = of(h1(`d`))
  return {
    react,
  }
}

/*
import React from "react"
import { h1 } from "@cycle/react-dom"

// export const App = () => <div>Hello, world</div>
// export const App = () => h1("hell")
export { App } from "./view"
*/
