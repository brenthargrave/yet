import { h, ReactSource } from "@cycle/react"
import { of } from "rxjs"
import React from "react"
import { ApolloProvider } from "@apollo/client"
import { isRoute, routes, RouteProvider } from "~/router"

import { View } from "./View"

import { client } from "~/graph"
import { context } from "~/context"

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
