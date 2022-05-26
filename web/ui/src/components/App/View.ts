import { ChakraProvider } from "@chakra-ui/react"
import { h } from "@cycle/react"
import { ErrorBoundary } from "@sentry/react"
import React, { FC } from "react"
import { productName, t } from "~/i18n"
import { Heading, Stack } from "~/system"

const Header = () =>
  h(Stack, { direction: "row", p: 4 }, [
    h(Heading, { size: "lg" }, productName),
  ])

const Footer = () =>
  h(Stack, { direction: "row", p: 4 }, [
    h(Heading, { size: "xs" }, t(`app.footer.copyright`)),
  ])

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
