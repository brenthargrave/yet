import React from "react"
import { h } from "@cycle/react"
import { ApolloProvider } from "@apollo/client"

import { RouteProvider } from "~/router"
import { client } from "~/graph"
import { context } from "~/context"
import { View } from "./View"

export const App = () => {
  return h(React.StrictMode, [
    h(RouteProvider, [
      h(
        ApolloProvider,
        // @ts-ignore
        { client },
        [h(View, { context })]
      ),
    ]),
  ])
}
