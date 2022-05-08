import * as Sentry from "@sentry/react"
import { run } from "@cycle/rxjs-run"
import { makeDOMDriver } from "@cycle/react-dom"

import * as React from "react"
import * as ReactDOM from "react-dom"
import { h } from "@cycle/react"

import { App } from "~/components/App"
import { makeRouterDriver, RouteProvider } from "~/router"

// @ts-ignore
const { VITE_API_ENV, VITE_SENTRY_DSN, VITE_SENTRY_DEBUG } = import.meta.env

Sentry.init({
  dsn: VITE_SENTRY_DSN,
  environment: VITE_API_ENV,
  debug: Boolean(VITE_SENTRY_DEBUG),
})

// run(App, {
//   react: makeDOMDriver(document.getElementById("index")),
//   router: makeRouterDriver(),
// })

/* eslint-disable */
ReactDOM.render(
  h(RouteProvider, [
    h(App)
  ]
  ), document.getElementById("index"))
