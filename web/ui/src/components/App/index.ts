import React from "react"
import { h } from "@cycle/react"
import { ApolloProvider } from "@apollo/client"

import { RouteProvider, useRoute } from "~/router"
import { client } from "~/graph"
import { context } from "~/context"
import { Landing } from "~/components/Landing"
import { Auth } from "~/components/Auth"
import { View } from "./View"

export const App = () => {
  const route = useRoute()
  return h(React.StrictMode, [
    h(RouteProvider, [
      h(
        ApolloProvider,
        // @ts-ignore
        { client },
        [
          h(View, {}, [
            // TODO: present global error
            // currentRoute.name === "home" && h(Landing),
            // currentRoute.name === "in" && h(Auth, { context }),
          ]),
        ]
      ),
    ]),
  ])
}
