import * as Sentry from "@sentry/react"
import { run } from "@cycle/rxjs-run"
import { makeDOMDriver } from "@cycle/react-dom"

import * as React from "react"
import * as ReactDOM from "react-dom"
import { h } from "@cycle/react"

import { App } from "~/components/App"
import { makeRouterDriver, RouteProvider } from "~/router"
import { makeDriver } from "~/notice"

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
  notice: makeDriver(),
})

/* eslint-disable */
// ReactDOM.render(
//   h(RouteProvider, [
//     h(App)
//   ]
//   ), document.getElementById("index"))
