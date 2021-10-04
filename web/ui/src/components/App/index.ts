import React from "react"
import { h } from "@cycle/react"
import { ApolloProvider } from "@apollo/client"
import { ChakraProvider } from "@chakra-ui/react"

import { RouteProvider, useRoute, isRoute, routes } from "~/router"
import { client } from "~/graph"
import { context } from "~/context"
import { Landing } from "~/components/Landing"
import { Auth } from "~/components/Auth"

export const App = () => {
  const route = useRoute()
  return h(React.StrictMode, [
    h(RouteProvider, [
      h(
        ApolloProvider,
        // @ts-ignore
        { client },
        [
          h(ChakraProvider, [
            // currentRoute.name === "home" && h(Landing),
            isRoute(route, routes.home) && h(Landing),
            // currentRoute.name === "in" && h(Auth, { context }),
            isRoute(route, routes.in) && h(Auth, { context }),
          ]),
        ]
      ),
    ]),
  ])
}
