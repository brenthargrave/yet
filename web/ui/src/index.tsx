import { makeDOMDriver } from "@cycle/react-dom"
import { run } from "@cycle/rxjs-run"

import { App } from "./components/app"

const container: HTMLElement | null = document.getElementById("main")!

run(App, {
  react: makeDOMDriver(container),
})

/*
import React from "react"
import ReactDOM from "react-dom"
import { App } from "./components/app"

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById("main")
)
 */
