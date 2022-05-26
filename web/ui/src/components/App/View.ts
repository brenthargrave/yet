import { ChakraProvider } from "@chakra-ui/react"
import { h } from "@cycle/react"
import { ErrorBoundary } from "@sentry/react"
import React, { FC } from "react"
import { productName } from "~/i18n"
import { Heading, Stack } from "~/system"

const Header = () =>
  h(Stack, { direction: "row" }, [h(Heading, { size: "lg" }, productName)])

const Footer = () =>
  h(Stack, { direction: "row" }, [h(Heading, { size: "lg" }, productName)])

export const View: FC = ({ children }) => {
  return h(React.StrictMode, [
    h(ErrorBoundary, { showDialog: true }, [
      h(ChakraProvider, [h(Header), children, h(Footer)]),
    ]),
  ])
}
