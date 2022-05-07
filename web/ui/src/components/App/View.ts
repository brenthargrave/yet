import React, { FC } from "react"
import { h } from "@cycle/react"
import { ChakraProvider } from "@chakra-ui/react"
import { ErrorBoundary } from "@sentry/react"

export const View: FC = ({ children }) => {
  return h(React.StrictMode, [
    h(ErrorBoundary, { showDialog: true }, [h(ChakraProvider, [children])]),
  ])
}
