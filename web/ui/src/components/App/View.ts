import { ChakraProvider, extendTheme } from "@chakra-ui/react"
import { h } from "@cycle/react"
import { ErrorBoundary } from "@sentry/react"
import React, { FC, ReactNode } from "react"
import { withProse } from "@nikolovlazar/chakra-ui-prose"
import { Stack } from "~/system"

const theme = extendTheme(
  {},
  withProse({
    baseStyle: {
      p: {
        padding: "0px",
        marginTop: "0px",
      },
    },
  })
)

interface Props {
  header: ReactNode
  body: ReactNode
}
export const View: FC<Props> = ({ header, body }) => {
  return h(React.StrictMode, [
    h(ErrorBoundary, { showDialog: true }, [
      h(ChakraProvider, { theme }, [
        h(
          Stack,
          {
            direction: "column",
            height: "100vh",
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
