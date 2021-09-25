import { h } from "@cycle/react"
import { ChakraProvider } from "@chakra-ui/react"
import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  NormalizedCacheObject,
} from "@apollo/client"

import { Landing } from "~/components/Landing"
import { Auth } from "~/components/Auth"

export type Graph = ApolloClient<NormalizedCacheObject>
const client = new ApolloClient({
  // TODO: use env var
  uri: "https://localhost:5443/graphql",
  cache: new InMemoryCache(),
})

export const App = () =>
  h(ChakraProvider, {}, [
    h(
      ApolloProvider,
      // @ts-ignore
      { client },
      [h(Auth, { graph: client })]
    ),
  ])
