import {
  ApolloClient,
  InMemoryCache,
  NormalizedCacheObject,
} from "@apollo/client"
import { isPresent } from "~/fp"
import { CreateVerificationDocument } from "./generated"

class GraphError extends Error {}

export type Client = ApolloClient<NormalizedCacheObject>

export const client = new ApolloClient({
  uri: "/graphql",
  cache: new InMemoryCache(),
})

export const signin = async (e164: string) => {
  const { data, errors } = await client.mutate({
    mutation: CreateVerificationDocument,
    variables: {
      input: { e164 },
    },
  })
  if (isPresent(errors)) throw new GraphError(JSON.stringify(errors))
  const payload = data?.createVerification
  if (!payload) throw new GraphError("MIA: payload")
  return payload
}
