import React, { FC, Fragment } from "react"
import { h } from "@cycle/react"
import { h1 } from "@cycle/react-dom"
import type { Route } from "type-route"

import { useToast } from "@chakra-ui/toast"
import { routes, isRoute, useRoute } from "~/router"

import { Landing } from "~/components/Landing"
import { Auth } from "~/components/Auth"
import { Context, context } from "~/context"

export const View = () => {
  const toast = useToast()
  const notify = (message: string): void => {
    toast({
      title: message,
      status: "error",
      duration: 9000,
      isClosable: true,
    })
  }
  const route = useRoute()
  return h(Fragment, [
    isRoute(route, routes.home()) && h(Landing),
    isRoute(route, routes.in()) && h(Auth, { context, notify }),
  ])
}

View.displayName = "AppView"

/*

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

*/
