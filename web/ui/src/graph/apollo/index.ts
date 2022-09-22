import {
  ApolloClient,
  InMemoryCache,
  createHttpLink,
  split,
  ApolloLink,
} from "@apollo/client"
import { setContext } from "@apollo/client/link/context"
import { persistCache, LocalStorageWrapper } from "apollo3-cache-persist"
// @ts-ignore
import { hasSubscription } from "@jumpn/utils-graphql"
import { Socket as PhoenixSocket } from "phoenix"
// @ts-ignore
import * as AbsintheSocket from "@absinthe/socket"
// @ts-ignore
import { createAbsintheSocketLink } from "@absinthe/socket-apollo-link"
import { sentryLink } from "./sentry"
import { errorLink } from "./error"

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

// NOTE: https://hexdocs.pm/absinthe/apollo.html
const authedHttpLink = authLink.concat(httpLink)

const { host } = window.location
const phoenixSocket = new PhoenixSocket(`wss://${host}/socket`, {
  params: () => {
    const token = localStorage.getItem(tokenCacheKey)
    if (token) {
      return { token }
    }
    return {}
  },
})
const absintheSocket = AbsintheSocket.create(phoenixSocket)
const websocketLink = createAbsintheSocketLink(absintheSocket)
const splitLink = split(
  (operation) => hasSubscription(operation.query),
  websocketLink,
  authedHttpLink
)

const link = ApolloLink.from([
  //
  sentryLink,
  errorLink,
  splitLink,
])

export const client = new ApolloClient({
  link,
  cache,
  defaultOptions: {
    query: {
      fetchPolicy: "network-only",
    },
    watchQuery: {
      fetchPolicy: "network-only",
    },
  },
})

// TODO: when signout added, ensure socket reconnects w/ new token on signin:
// https://hexdocs.pm/absinthe/apollo.html#reconnecting-the-websocket-link
