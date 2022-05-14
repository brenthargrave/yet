import {
  ApolloClient,
  InMemoryCache,
  NormalizedCacheObject,
} from "@apollo/client"
import { createClient, defaultExchanges } from "@urql/core"
import { from, map } from "rxjs"

import { devtoolsExchange } from "@urql/devtools"
import { getId } from "./anon"
import { isPresent } from "~/fp"
import {
  CreateVerificationDocument,
  CreateVerificationInput,
  Event,
  EventName,
  EventProperties,
  TrackEventDocument,
} from "./generated"

export * from "./generated"

class GraphError extends Error {}

export type Client = ApolloClient<NormalizedCacheObject>

export const client = new ApolloClient({
  uri: "/graphql",
  cache: new InMemoryCache(),
})

const urqlClient = createClient({
  url: "/graphql",
  exchanges: [devtoolsExchange, ...defaultExchanges],
})
export const verifyPhone$ = (input: CreateVerificationInput) =>
  from(
    urqlClient.mutation(CreateVerificationDocument, { input }).toPromise()
  ).pipe(
    map(({ data, error }) => {
      if (error) throw error // TODO: extract into rxjs operator
      return data?.createVerification
    })
  )

export const signin = async (input: CreateVerificationInput) => {
  const result = client.mutate({
    mutation: CreateVerificationDocument,
    variables: {
      input,
    },
  })
  const { data, errors } = await result
  if (isPresent(errors)) throw new GraphError(JSON.stringify(errors))
  const payload = data?.createVerification
  if (!payload) throw new GraphError("MIA: payload")
  return payload
}

// Analytics
//

const anonId = getId()

export const track = async (
  name: EventName,
  properties: EventProperties = {}
): Promise<Event> => {
  const input = {
    anonId,
    name,
    properties,
  }
  const { data, errors } = await client.mutate({
    mutation: TrackEventDocument,
    variables: {
      input,
    },
  })
  if (isPresent(errors)) throw new GraphError(JSON.stringify(errors))
  const event = data?.trackEvent
  if (event) {
    return event
  }
  throw new GraphError("MIA: event")
}
