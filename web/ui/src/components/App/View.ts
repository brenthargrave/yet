import React, { FC } from "react"
import { h } from "@cycle/react"
import { h1 } from "@cycle/react-dom"
import { ChakraProvider } from "@chakra-ui/react"
import type { Route } from "type-route"

import { routes, isRoute } from "~/router"

/*
import { h } from "@cycle/react"
import { ChakraProvider } from "@chakra-ui/react"

import { Landing } from "~/components/Landing"
import { useRoute, isRoute, routes } from "~/router"
import { Auth } from "~/components/Auth"
import { Context } from "~/context"

export const View = ({ context }: { context: Context }) => {
  const route = useRoute()
  return h(ChakraProvider, [
    isRoute(route, routes.home) && h(Landing),
    isRoute(route, routes.in) && h(Auth, { context }),
  ])
}

View.displayName = "AppView"
*/

interface Props {
  route: Route<typeof routes>
}
export const View: FC<Props> = ({ route, children }) => {
  return h(React.StrictMode, [
    h(ChakraProvider, [
      children,
      // h1(`hello, world`),
      // isRoute(route, routes.home()) && h(Landing),
      // isRoute(route, routes.in()) && h(Auth, { context }),
    ]),
  ])
}
