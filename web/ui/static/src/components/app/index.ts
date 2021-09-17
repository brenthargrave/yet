import { h1 } from "@cycle/react-dom"
// export const App = () => h1("Hello, world!")
import { h, ReactSource } from "@cycle/react"
import { of } from "rxjs"

interface Sources {
  react: ReactSource
}

const view = () => h1("Hello, world!")

export const App = (_sources: Sources) => {
  const react = of(h(view))
  return {
    react,
  }
}
