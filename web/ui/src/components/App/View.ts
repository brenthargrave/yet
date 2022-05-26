import { ChakraProvider } from "@chakra-ui/react"
import { h } from "@cycle/react"
import { ErrorBoundary } from "@sentry/react"
import React, { FC } from "react"
import { Stack } from "~/system"
import { Footer } from "./Footer"
import { Header } from "./Header"

export const View: FC = ({ children }) => {
  return h(React.StrictMode, [
    h(ErrorBoundary, { showDialog: true }, [
      h(ChakraProvider, [
        h(Stack, { direction: "column", width: "100vw", height: "100vh" }, [
          h(Header),
          children,
          h(Footer),
        ]),
      ]),
    ]),
  ])
}
