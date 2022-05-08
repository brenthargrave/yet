/* eslint-disable */
import React, { FC } from "react"
import { h } from "@cycle/react"
import { ChakraProvider } from "@chakra-ui/react"
import { ErrorBoundary } from "@sentry/react"
import { RouteProvider } from "~/router"

export const View: FC = ({ children }) => {
  return h(React.StrictMode, [
    h(ErrorBoundary, { showDialog: true }, [
      h(ChakraProvider, [
        children
      ])
    ]),
  ])
}
