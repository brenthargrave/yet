import { h } from "@cycle/react"
import React from "react"
import { ApolloProvider } from "@apollo/client"
import { ChakraProvider } from "@chakra-ui/react"

import { RouteProvider } from "~/router"
import { View } from "./View"
import { client } from "~/graph"

export const App = () => {
  return h(React.StrictMode, [
    h(RouteProvider, [
      h(
        ApolloProvider,
        // @ts-ignore
        { client },
        [h(ChakraProvider, [h(View)])]
      ),
    ]),
  ])
}

/*

interface Sources {
  react: ReactSource
}
export const App = (sources: Sources) => {
  // TODO
  // const { history$ } = sources.router
  // const react = history$.pipe(
  //   flatMap((route) => {
  //     h(View, { route })
  //   })
  // )
  const react = of(h(View))
  return {
    react,
  }
}

 */
