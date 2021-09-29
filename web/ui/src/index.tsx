import React from "react"
import ReactDOM from "react-dom"
import { h } from "@cycle/react"
import { ChakraProvider } from "@chakra-ui/react"
import { ApolloProvider } from "@apollo/client"
import * as Sentry from "@sentry/react"
import { Integrations } from "@sentry/tracing"

import { RouteProvider } from "~/router"
import { App } from "~/components/App"
import { client } from "~/graph"
import { ErrorAlert } from "~/system/ErrorAlert"

// @ts-ignore
const { VITE_API_ENV, VITE_SENTRY_DSN, VITE_SENTRY_DEBUG } = import.meta.env

Sentry.init({
  dsn: VITE_SENTRY_DSN,
  environment: VITE_API_ENV,
  debug: Boolean(VITE_SENTRY_DEBUG),
  integrations: [new Integrations.BrowserTracing()],
  tracesSampleRate: 1.0,
})

ReactDOM.render(
  h(React.StrictMode, [
    h(Sentry.ErrorBoundary, { fallback: h(ErrorAlert), showDialog: true }, [
      h(RouteProvider, [
        h(ChakraProvider, {}, [
          h(
            ApolloProvider,
            // @ts-ignore
            { client },
            [h(App)]
          ),
        ]),
      ]),
    ]),
  ]),
  document.getElementById("index")
)
