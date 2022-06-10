import { ChakraProvider } from "@chakra-ui/react"
import { h } from "@cycle/react"
import { ErrorBoundary } from "@sentry/react"
import React, { FC, ReactNode } from "react"
import { Stack } from "~/system"

interface Props {
  header: ReactNode
  body: ReactNode
}
export const View: FC<Props> = ({ header, body }) => {
  return h(React.StrictMode, [
    h(ErrorBoundary, { showDialog: true }, [
      h(ChakraProvider, [
        h(
          Stack,
          {
            direction: "column",
            // TODO: enable height-centered body views wrt viewport height
            // height: "100vh",
          },
          [
            header,
            body,
            // footer,
          ]
        ),
      ]),
    ]),
  ])
}

View.displayName = "AppView"
