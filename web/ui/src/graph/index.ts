import { Observable, filter, from, map, tap, BehaviorSubject } from "rxjs"
import { isNotNullish } from "rxjs-etc"

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
} from "./generated"

import { client } from "./urql"

export * from "./generated"

const tokenKey = "token"
const token$$ = new BehaviorSubject<string | null>(
  localStorage.getItem(tokenKey)
)
export const setToken = (token: string) => {
  localStorage.setItem(tokenKey, token)
  token$$.next(token)
}

export const submitPhone$ = (input: SubmitPhoneInput) =>
  from(client.mutation(SubmitPhoneDocument, { input }).toPromise()).pipe(
    map(({ data, error }) => {
      if (error) throw error // TODO: operator
      return data?.submitPhone
    }),
    filter(isNotNullish)
  )

export const verifyCode$ = (input: SubmitCodeInput) =>
  from(client.mutation(SubmitCodeDocument, { input }).toPromise()).pipe(
    map(({ data, error }) => {
      if (error) throw error // TODO: operator
      return data?.submitCode
    }),
    filter(isNotNullish)
  )

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
  const result = await client
    .mutation(TrackEventDocument, { input })
    .toPromise()
  return result.data?.trackEvent as Event
}
