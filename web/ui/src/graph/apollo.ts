import {
  ApolloClient,
  InMemoryCache,
  createHttpLink,
  NormalizedCacheObject,
} from "@apollo/client"
import { setContext } from "@apollo/client/link/context"

const httpLink = createHttpLink({
  uri: "/graphql",
  credentials: "same-origin",
})

export const tokenCacheKey = "token"

const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem(tokenCacheKey)
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    },
  }
})

export type Client = ApolloClient<NormalizedCacheObject>

export const client = new ApolloClient({
  link: authLink.concat(httpLink),
  // TODO: persistent cache
  cache: new InMemoryCache(),
})
