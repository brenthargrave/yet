import {
  ApolloClient,
  InMemoryCache,
  NormalizedCacheObject,
} from "@apollo/client"
import { ulid } from "ulid"

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

// TODO: clobber installId on signout
// console.debug("ulid", ulid())
// let id = localStorage.getItem("graph.install_id")
// console.debug("GET id", id)
// if (!id) {
//   id = ulid()
//   console.debug("SET id", id)
//   localStorage.setItem("graph.install_id", id)
// }
const id = "TODO"

export const track = async (
  name: EventName,
  props?: EventProperties
): Promise<Event> => {
  const properties: EventProperties = {
    install: {
      id,
    },
    ...props,
  }
  const input = {
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
  const event = data?.trackEvent?.event
  if (event) {
    return event
  }
  throw new GraphError("MIA: event")
}
