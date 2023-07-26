import * as Sentry from "@sentry/react"
import { run } from "@cycle/rxjs-run"
import { makeDOMDriver } from "@cycle/react-dom"

import { App } from "~/components/App"
import { makeDriver as makeRouterDriver } from "~/router"
import { makeDriver as makeNoticeDriver } from "~/notice"
import { makeDriver as makeGraphDriver } from "./graph/driver"
import { makeDriver as makeTrackDriver } from "./track"
import { makeDriver as makeActionDriver } from "~/action"

const environment = import.meta.env.VITE_API_ENV
const dsn = import.meta.env.VITE_SENTRY_DSN
const debug = Boolean(import.meta.env.VITE_SENTRY_DEBUG)

const options: Sentry.BrowserOptions = {
  dsn,
  environment,
  debug,
  tunnel: "/api/sentry",
  transportOptions: {
    dsn,
  },
  beforeSend: (event) =>
    debug || ["prod", "test"].includes(environment) ? event : null,
}
if (debug) console.debug("Sentry options", options)
Sentry.init(options)

run(App, {
  react: makeDOMDriver(document.getElementById("index")),
  router: makeRouterDriver(),
  notice: makeNoticeDriver(),
  graph: makeGraphDriver(),
  track: makeTrackDriver(),
  action: makeActionDriver(),
})
