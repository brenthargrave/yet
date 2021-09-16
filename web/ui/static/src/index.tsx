import React from "react"
import ReactDOM from "react-dom"

import "@fontsource/roboto/300.css"
import "@fontsource/roboto/400.css"
import "@fontsource/roboto/500.css"
import "@fontsource/roboto/700.css"

import { Typography } from "@mui/material"

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
