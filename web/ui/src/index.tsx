import * as Sentry from "@sentry/react"
import { Integrations } from "@sentry/tracing"
import { run } from "@cycle/rxjs-run"
import { makeDOMDriver } from "@cycle/react-dom"

import { App } from "~/components/App"

// @ts-ignore
const { VITE_API_ENV, VITE_SENTRY_DSN, VITE_SENTRY_DEBUG } = import.meta.env

Sentry.init({
  dsn: VITE_SENTRY_DSN,
  environment: VITE_API_ENV,
  debug: Boolean(VITE_SENTRY_DEBUG),
  integrations: [new Integrations.BrowserTracing()],
  tracesSampleRate: 1.0,
})

run(App, {
  react: makeDOMDriver(document.getElementById("index")),
})
