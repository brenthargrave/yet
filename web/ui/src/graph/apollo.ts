import { ApolloClient, InMemoryCache, createHttpLink } from "@apollo/client"
import { setContext } from "@apollo/client/link/context"
import { persistCache, LocalStorageWrapper } from "apollo3-cache-persist"

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

const cache = new InMemoryCache()

// TODO: https://github.com/apollographql/apollo-cache-persist/tree/eeb3efe83a6e0bee18a3e396f9abf1dc57077e4b#web
// > await before instantiating ApolloClient, else queries might run before the cache is persisted
await persistCache({
  cache,
  storage: new LocalStorageWrapper(window.localStorage),
})

export const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache,
})
