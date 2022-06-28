/* eslint @typescript-eslint/no-non-null-assertion: 0 */
/* eslint no-console: 0 */
/* eslint max-classes-per-file: 0 */

import { captureException } from "@sentry/react"
import {
  BehaviorSubject,
  catchError,
  filter,
  from,
  map,
  Observable,
  of,
  shareReplay,
  startWith,
} from "rxjs"
import { isNotNullish } from "rxjs-etc"
import { switchMap } from "rxjs/operators"
import { Err, Ok, Result } from "ts-results"
import { isNil, none, not, propSatisfies, toLower } from "~/fp"
import { makeTagger } from "~/log"
import { zenToRx } from "~/rx"
import { getId } from "./anon"
import { client, tokenCacheKey } from "./apollo"
import {
  CheckTokenDocument,
  ContactsDocument,
  ConversationInput,
  Customer,
  Event,
  EventName,
  EventProperties,
  GetConversationsDocument,
  Maybe,
  MeDocument,
  ProfileInput,
  ProfileProp,
  SubmitCodeDocument,
  SubmitCodeInput,
  SubmitPhoneDocument,
  SubmitPhoneInput,
  SubmitPhoneResult,
  TrackEventDocument,
  TrackEventInput,
  UpdateProfileDocument,
  UpsertConversationDocument,
  UserError,
  ViewConversationDocument,
} from "./generated"
import { client as urqlClient } from "./urql"

export { loggedIn, loggedOut } from "./driver"
export type { Commands, Source } from "./driver"
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

export const checkToken$ = () => {
  return from(
    client.query({ query: CheckTokenDocument, fetchPolicy: "network-only" })
  ).pipe(
    map(({ data, errors }) => {
      if (errors) throw new GraphError(JSON.stringify(errors))
      return data!.checkToken?.token
    }),
    tag("checkToken$")
  )
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

// TODO: add event.occurred_at timestamp, set client-side (don't rely on network timing)
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
    }),
    tag("track$")
  )
}

export const contacts$ = token$.pipe(
  switchMap((token) => {
    if (!token) return of(null)
    return zenToRx(client.watchQuery({ query: ContactsDocument })).pipe(
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
          return data.contacts
        }
      ),
      filter(isNotNullish),
      tag("watchQuery(contacts)")
    )
  }),
  catchError((error, _caught$) => {
    throw new GraphWatchError(error.message)
  }),
  tag("contacts$"),
  filter(isNotNullish),
  shareReplay()
)

export const upsertConversation$ = (input: ConversationInput) => {
  return from(
    client.mutate({
      mutation: UpsertConversationDocument,
      variables: { input },
    })
  ).pipe(
    map(({ data, errors, extensions, context }) => {
      if (errors) throw new GraphError(JSON.stringify(errors))
      return data!.upsertConversation!
    }),
    tag("upsertConversation$")
  )
}

export const getConversation$ = (id: string) =>
  from(
    client.query({
      query: ViewConversationDocument,
      variables: { id },
      fetchPolicy: "no-cache",
    })
  ).pipe(
    map(({ data, errors }) => {
      if (errors) throw new GraphError(JSON.stringify(errors))
      const { userError, conversation } = data!.getConversation!
      return userError ? new Err(userError) : new Ok(conversation!)
    }),
    tag("getConversation$")
  )

export type { Conversation } from "./generated"

export const conversations$ = token$.pipe(
  filter(isNotNullish),
  switchMap((token) => {
    return zenToRx(client.watchQuery({ query: GetConversationsDocument })).pipe(
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
          return data.getConversations?.conversations
        }
      ),
      filter(isNotNullish),
      tag("watchQuery(conversations)")
    )
  }),
  catchError((error, _caught$) => {
    throw new GraphWatchError(error.message)
  }),
  startWith([]),
  tag("conversations$"),
  shareReplay()
)
