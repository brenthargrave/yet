import { ChakraProvider } from "@chakra-ui/react"
import { h } from "@cycle/react"
import { ErrorBoundary } from "@sentry/react"
import React, { ReactNode } from "react"
import { Stack } from "~/system"

interface Props {
  header: ReactNode
  // footer: ReactNode
  body: ReactNode
}
export const View = ({ header, body }: Props) => {
  return h(React.StrictMode, [
    h(ErrorBoundary, { showDialog: true }, [
      h(ChakraProvider, [
        h(Stack, { direction: "column", width: "100vw", height: "100vh" }, [
          header,
          body,
          // footer,
        ]),
      ]),
    ]),
  ])
}
