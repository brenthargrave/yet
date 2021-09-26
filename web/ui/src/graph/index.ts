import {
  ApolloClient,
  InMemoryCache,
  NormalizedCacheObject,
} from "@apollo/client"

export type Client = ApolloClient<NormalizedCacheObject>

export const client = new ApolloClient({
  uri: "/graphql",
  cache: new InMemoryCache(),
})
