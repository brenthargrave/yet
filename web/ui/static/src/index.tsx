import { makeDOMDriver } from "@cycle/react-dom"
import { run } from "@cycle/rxjs-run"

import { App } from "./components/app"

// NOTE: import env vars: https://git.io/Ju5w6
// @ts-ignore
// TODO: const { MIX_ENV } = import.meta.env

const container: HTMLElement | null = document.getElementById("main")

if (container) {
  run(App, {
    react: makeDOMDriver(container),
  })
}

// TODO: HMR
// if (import.meta.hot) {
//   import.meta.hot.accept();
// }
