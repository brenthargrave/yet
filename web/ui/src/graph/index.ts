import {
  ApolloClient,
  InMemoryCache,
  NormalizedCacheObject,
} from "@apollo/client"

import { getId } from "./installation"
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

export const signin = async (input: CreateVerificationInput) => {
  const { data, errors } = await client.mutate({
    mutation: CreateVerificationDocument,
    variables: {
      input,
    },
  })
  if (isPresent(errors)) throw new GraphError(JSON.stringify(errors))
  const payload = data?.createVerification
  if (!payload) throw new GraphError("MIA: payload")
  return payload
}

export const track = async (
  name: EventName,
  properties: EventProperties = {}
): Promise<Event> => {
  const anonId = getId()
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
