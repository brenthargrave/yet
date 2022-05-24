import {
  Observable,
  filter,
  from,
  map,
  BehaviorSubject,
  of,
  shareReplay,
} from "rxjs"
import { switchMap } from "rxjs/operators"
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
  UpdateProfileDocument,
  ProfileInput,
  Customer,
} from "./generated"
import { zenToRx } from "~/rx"
import { makeTagger } from "~/log"
import { useError } from "react-use"

export type { Source, Commands } from "./driver"
export { loggedIn, loggedOut } from "./driver"

export * from "./generated"

const tag = makeTagger("graph")

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
      if (errors) throw new GraphError(JSON.stringify(errors))
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
      if (errors) throw new GraphError(JSON.stringify(errors))
      return data?.submitCode
    }),
    filter(isNotNullish)
  )

type Success = { success: boolean; me: Customer }
type Failure = { success: boolean; userError: UserError }
type Result = Success | Failure
// export const updateProfile$ = (input: ProfileInput) =>
export const updateProfile$ = (input: ProfileInput): Observable<Result> =>
  from(
    client.mutate({
      mutation: UpdateProfileDocument,
      variables: { input },
    })
  ).pipe(
    map(({ data, errors, extensions, context }) => {
      if (errors) throw new GraphError(JSON.stringify(errors))
      if (!data?.updateProfile) throw new GraphError("MIA: payload")
      const { success, me, userError } = data.updateProfile
      if (success) {
      }
      return success ? { success: true, me as Customer } : { success: false, userError as UserError }
    }),
    filter(isNotNullish)
  )

const token$$ = new BehaviorSubject<string | null>(
  localStorage.getItem(tokenCacheKey)
)
export const token$ = token$$.asObservable().pipe(tag("token$"), shareReplay())
export const setToken = (token: string | null | undefined) => {
  console.debug(`setToken(${token})`)
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
  switchMap((token) => {
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
          // NOTE: throw will create endless loop upon resubscription
          if (error) console.error(`apollo error ${error}`) // throw error
          if (errors) console.error(`errors ${errors}`) // throw new GraphError(JSON.stringify(errors))
          return data.me
        }
      ),
      filter(isNotNullish),
      tag("watchQuery(me)")
    )
  }),
  tag("me$"),
  shareReplay()
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
