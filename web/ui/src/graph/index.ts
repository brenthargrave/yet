/* eslint @typescript-eslint/no-non-null-assertion: 0 */
/* eslint no-console: 0 */
/* eslint max-classes-per-file: 0 */

import {
  Observable,
  filter,
  from,
  map,
  BehaviorSubject,
  of,
  shareReplay,
  catchError,
} from "rxjs"
import { switchMap } from "rxjs/operators"
import { isNotNullish } from "rxjs-etc"
import { Ok, Err, Result } from "ts-results"
import { captureException } from "@sentry/react"

import {
  all,
  find,
  isNil,
  none,
  not,
  prop,
  propSatisfies,
  toLower,
  trim,
} from "ramda"
import { isPresent } from "framer-motion/types/components/AnimatePresence/use-presence"
import { client as urqlClient } from "./urql"
import { client, tokenCacheKey } from "./apollo"
import { getId } from "./anon"
import {
  SubmitPhoneInput,
  SubmitPhoneDocument,
  SubmitCodeInput,
  SubmitCodeDocument,
  Event,
  EventName,
  EventProperties,
  TrackEventDocument,
  UserError,
  SubmitPhoneResult,
  MeDocument,
  UpdateProfileDocument,
  ProfileInput,
  Customer,
  ProfileProp,
  Maybe,
  TrackEventInput,
} from "./generated"
import { zenToRx } from "~/rx"
import { makeTagger } from "~/log"

export type { Source, Commands } from "./driver"
export { loggedIn, loggedOut } from "./driver"

export * from "./generated"

const tag = makeTagger("graph")

export class GraphError extends Error {}
export class GraphWatchError extends GraphError {}

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

type CustomerProfileOnly = Omit<Customer, "e164" | "token">
export const updateProfile$ = (
  input: ProfileInput
): Observable<Result<CustomerProfileOnly, UserError>> =>
  from(
    client.mutate({
      mutation: UpdateProfileDocument,
      variables: { input },
    })
  ).pipe(
    map(({ data, errors, extensions, context }) => {
      if (errors) throw new GraphError(JSON.stringify(errors))
      const { userError, me } = data!.updateProfile!
      return userError ? new Err(userError) : new Ok(me!)
    })
  )

const token$$ = new BehaviorSubject<string | null>(
  localStorage.getItem(tokenCacheKey)
)
export const token$ = token$$.asObservable().pipe(tag("token$"), shareReplay())
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
          if (error) captureException(error)
          if (errors) captureException(JSON.stringify(errors))
          return data.me
        }
      ),
      filter(isNotNullish),
      tag("watchQuery(me)")
    )
  }),
  catchError((error, _caught$) => {
    throw new GraphWatchError(error.message)
  }),
  tag("me$"),
  shareReplay()
)

export const isAuthenticated = (me: Maybe<Customer>) => isNotNullish(me)
export const isLurking = (me: Maybe<Customer>) => not(isAuthenticated(me))

export const isOnboard = (me: Maybe<Customer>) =>
  none(
    (prop) => propSatisfies(isNil, toLower(prop), me),
    Object.values(ProfileProp)
  )
export const isOnboarding = (me: Maybe<Customer>) => not(isOnboard(me))

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

export const track$ = (_input: Omit<TrackEventInput, "anonId">) => {
  const input = { ..._input, anonId }
  return from(
    client.mutate({
      mutation: TrackEventDocument,
      variables: { input },
    })
  ).pipe(
    map(({ data, errors, extensions, context }) => {
      if (errors) throw new GraphError(JSON.stringify(errors))
      return data!.trackEvent!
    })
  )
}
