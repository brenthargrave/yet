import {
  Observable,
  filter,
  from,
  map,
  tap,
  BehaviorSubject,
  of,
  EMPTY,
} from "rxjs"
import { isNotNullish } from "rxjs-etc"

import { client as urqlClient } from "./urql"
import { client } from "./apollo"
import { getId } from "./anon"
import {
  SubmitPhoneInput,
  SubmitPhoneDocument,
  SubmitCodeInput,
  SubmitCodeDocument,
  SubmitCodePayload,
  Event,
  EventName,
  EventProperties,
  TrackEventDocument,
  Verification,
  VerificationStatus,
  UserError,
  SubmitPhoneResult,
} from "./generated"
import { isNotEmpty } from "~/fp"

export type { Source } from "./driver"

export * from "./generated"

const tokenKey = "token"
const token$$ = new BehaviorSubject<string | null>(
  localStorage.getItem(tokenKey)
)
export const setToken = (token: string) => {
  localStorage.setItem(tokenKey, token)
  token$$.next(token)
}

class GraphError extends Error {}

export const submitPhone$ = (
  input: SubmitPhoneInput
): Observable<SubmitPhoneResult> =>
  from(
    client.mutate({
      mutation: SubmitPhoneDocument,
      variables: { input },
    })
  ).pipe(
    map(({ data, errors, extensions, context }) => {
      if (errors && isNotEmpty(errors)) {
        // TODO: throw error operator
        throw new GraphError(JSON.stringify(errors))
      }
      return data?.submitPhone
    }),
    filter(isNotNullish)
  )

export const verifyCode$ = (input: SubmitCodeInput) =>
  from(
    client.mutate({
      mutation: SubmitCodeDocument,
      variables: { input },
    })
  ).pipe(
    map(({ data, errors, extensions, context }) => {
      if (errors && isNotEmpty(errors)) {
        // TODO: throw error operator
        throw new GraphError(JSON.stringify(errors))
      }
      return data?.submitCode
    }),
    filter(isNotNullish)
  )
// from(client.mutation(SubmitCodeDocument, { input }).toPromise()).pipe(
//   map(({ data, error }) => {
//     if (error) throw error // TODO: operator
//     return data?.submitCode
//   }),
//   filter(isNotNullish)
// )

/* // TODO: custom operator to filter result types
interface GQLType {
  __typename: string
}
export const filterType = <T extends GQLType>(typename: string) =>
  filter((result: T): result is T => result.__typename === typename)
*/

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
  const result = await urqlClient
    .mutation(TrackEventDocument, { input })
    .toPromise()
  return result.data?.trackEvent as Event
}
