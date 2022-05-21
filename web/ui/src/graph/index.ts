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
import { concatMap } from "rxjs/operators"
import { isNotNullish } from "rxjs-etc"

import { CombinedError } from "@urql/core"
import { client as urqlClient } from "./urql"
import { client, tokenCacheKey } from "./apollo"
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
  MeDocument,
} from "./generated"
import { isNotEmpty } from "~/fp"
import { zenToRx } from "~/rx"

export type { Source, Commands } from "./driver"
export { loggedIn, loggedOut } from "./driver"

export * from "./generated"

export class GraphError extends Error {}

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

const token$$ = new BehaviorSubject<string | null>(
  localStorage.getItem(tokenCacheKey)
)
export const token$ = token$$.asObservable()
export const setToken = (token: string | null | undefined) => {
  if (token) {
    localStorage.setItem(tokenCacheKey, token)
    token$$.next(token)
  } else {
    localStorage.clear()
    token$$.next(null)
    client.clearStore()
  }
}

// NOTE: emits null until token set
export const me$ = token$.pipe(
  concatMap((token) => {
    if (!token) return of(null)
    return zenToRx(client.watchQuery({ query: MeDocument })).pipe(
      map(
        ({
          data,
          error,
          errors,
          loading,
          networkStatus,
          partial,
          ...result
        }) => {
          if (error) throw error
          if (isNotEmpty(errors)) throw new GraphError(JSON.stringify(errors))
          return data.me
        }
      ),
      filter(isNotNullish)
    )
  })
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
  const result = await urqlClient
    .mutation(TrackEventDocument, { input })
    .toPromise()
  return result.data?.trackEvent as Event
}
