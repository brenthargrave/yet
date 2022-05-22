import * as Sentry from "@sentry/react"
import { run } from "@cycle/rxjs-run"
import { makeDOMDriver } from "@cycle/react-dom"

import { App } from "~/components/App"
import { makeDriver as makeRouterDriver } from "~/router"
import { makeDriver as makeNoticeDriver } from "~/notice"
import { makeDriver as makeGraphDriver } from "./graph/driver"

// @ts-ignore
const { VITE_API_ENV, VITE_SENTRY_DSN, VITE_SENTRY_DEBUG } = import.meta.env

const environment = VITE_API_ENV
const debug = Boolean(VITE_SENTRY_DEBUG)
Sentry.init({
  dsn: VITE_SENTRY_DSN,
  environment,
  debug,
  beforeSend: (event) => (environment === "prod" ? event : null),
})

run(App, {
  react: makeDOMDriver(document.getElementById("index")),
  router: makeRouterDriver(),
  notice: makeNoticeDriver(),
  graph: makeGraphDriver(),
})

/* eslint-disable */
// import * as React from "react"
// import * as ReactDOM from "react-dom"
// import { h } from "@cycle/react"
// ReactDOM.render(
//   h(RouteProvider, [
//     h(App)
//   ]
//   ), document.getElementById("index"))
