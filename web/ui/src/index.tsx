import React from "react"
import ReactDOM from "react-dom"
import { h } from "@cycle/react"
import { ChakraProvider } from "@chakra-ui/react"
import { ApolloProvider } from "@apollo/client"

import { RouteProvider } from "~/router"
import { App } from "~/components/App"
import { client } from "~/graph"

ReactDOM.render(
  h(React.StrictMode, [
    h(RouteProvider, [
      h(ChakraProvider, {}, [
        h(
          ApolloProvider,
          // @ts-ignore
          { client },
          [h(App)]
        ),
      ]),
    ]),
  ]),
  document.getElementById("index")
)
