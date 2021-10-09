import React, { FC, Fragment } from "react"
import { h } from "@cycle/react"
import { h1 } from "@cycle/react-dom"
import type { Route } from "type-route"

import { routes, isRoute, useRoute } from "~/router"

import { Landing } from "~/components/Landing"
import { Auth } from "~/components/Auth"
import { Context } from "~/context"

export const View = ({ context }: { context: Context }) => {
  const route = useRoute()
  return h(Fragment, [
    isRoute(route, routes.home()) && h(Landing),
    isRoute(route, routes.in()) && h(Auth, { context }),
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
