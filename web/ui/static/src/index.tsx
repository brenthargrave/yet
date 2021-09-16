import ReactDOM from "react-dom"
import { h } from "@cycle/react"

import { App } from "./components/app"

// NOTE: import env vars: https://git.io/Ju5w6
// @ts-ignore
const { MIX_ENV } = import.meta.env
console.debug(`MIX_ENV : ${MIX_ENV}`)

ReactDOM.render(h(App), document.getElementById("main"))

// TODO: HMR
// if (import.meta.hot) {
//   import.meta.hot.accept();
// }
