/* eslint @typescript-eslint/no-non-null-assertion: 0 */
/* eslint no-console: 0 */
/* eslint max-classes-per-file: 0 */

import { captureException } from "@sentry/react"
import { GraphQLError } from "graphql"
import { filter as _filter, first, pipe, reverse, sort } from "remeda"
import {
  BehaviorSubject,
  catchError,
  debounceTime,
  EMPTY,
  filter,
  from,
  map,
  merge,
  MonoTypeOperatorFunction,
  Observable,
  of,
  tap,
} from "rxjs"
import { isNotNullish } from "rxjs-etc"
import { switchMap } from "rxjs/operators"
import { Err, Ok } from "ts-results"
import { filterResultOk, resultMap } from "ts-results/rxjs-operators"
import { isNotEmpty } from "~/fp"
import { makeTagger } from "~/log"
import { shareLatest, zenToRx } from "~/rx"
import { getId } from "./anon"
import { client, tokenCacheKey } from "./apollo"
import {
  CheckTokenDocument,
  ContactsDocument,
  ConversationChangedDocument,
  ConversationChangedInput,
  ConversationInput,
  ConversationStatus,
  DeleteConversationDocument,
  DeleteConversationInput,
  Event,
  EventName,
  EventProperties,
  GetConversationsDocument,
  GetOppDocument,
  GetOppsDocument,
  GetProfileDocument,
  GetProfileInput,
  GetTimelineDocument,
  MeDocument,
  OppInput,
  PatchProfileDocument,
  PatchProfileInput,
  ProposeConversationDocument,
  ProposeInput,
  ReviewConversationDocument,
  ReviewInput,
  Scalars,
  SignConversationDocument,
  SignInput,
  SubmitCodeDocument,
  SubmitCodeInput,
  SubmitPhoneDocument,
  SubmitPhoneInput,
  SubmitPhoneResult,
  TimelineEventsAddedDocument,
  TimelineEventsAddedInput,
  TimelineInput,
  TrackEventDocument,
  TrackEventInput,
  UpdateProfileDocument,
  UpdateProfileInput,
  UpsertConversationDocument,
  UpsertOppDocument,
  ViewConversationDocument,
} from "./generated"
import { hasAllRequiredProfileProps, isAuthenticated } from "./models"
import { client as urqlClient } from "./urql"

export { loggedIn, loggedOut } from "./driver"
export type { Commands, Source } from "./driver"
export * from "./generated"
export * from "./models"
export type ID = Scalars["ID"]

const tag = makeTagger("graph")

export class GraphError extends Error {}
export class UnrecoverableGraphError extends GraphError {}

export function eatUnrecoverableError<T>(
  callback?: (error: Error, caught: Observable<T>) => void
): MonoTypeOperatorFunction<T> {
  return (source) =>
    source.pipe(
      catchError((error, caught$) => {
        if (callback) callback(error, caught$)
        // NOTE: graph watch errors are fatal, will loop indefinitely if resubscribed
        return error instanceof UnrecoverableGraphError
          ? EMPTY
          : caught$.pipe(tag("caught$"))
      })
    )
}

export function handleGraphErrors<T>(): MonoTypeOperatorFunction<T> {
  return (source) =>
    source.pipe(
      tap((res) => {
        let errors: GraphQLError[] = []
        // @ts-ignore
        if (res.errors) errors = res.errors
        if (isNotEmpty(errors)) {
          throw first(errors)
        }
      })
    )
}

export function makeUnrecoverable<T>(): MonoTypeOperatorFunction<T> {
  return (source) =>
    source.pipe(
      catchError((error, _caught$) => {
        throw new UnrecoverableGraphError(error.message, { cause: error })
      })
    )
}

export const submitPhone$ = (
  input: SubmitPhoneInput
): Observable<SubmitPhoneResult> =>
  from(
    client.mutate({
      mutation: SubmitPhoneDocument,
      variables: { input },
    })
  ).pipe(
    handleGraphErrors(),
    map((response) => {
      return response.data?.submitPhone
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
    handleGraphErrors(),
    map(({ data, errors, extensions, context }) => {
      return data?.submitCode
    }),
    filter(isNotNullish)
  )

const token$$ = new BehaviorSubject<string | null>(
  localStorage.getItem(tokenCacheKey)
)
export const token$ = token$$.asObservable().pipe(tag("token$"), shareLatest())
export const setToken = (token: string | null | undefined) => {
  if (token) {
    localStorage.setItem(tokenCacheKey, token)
    token$$.next(token)
  } else {
    localStorage.clear()
    token$$.next(null)
    // NOTE: call .stop() to avoid error: ""
    // https://github.com/apollographql/apollo-client/issues/2919#issuecomment-7327464900
    client.stop()
    client.clearStore()
  }
}

export const checkToken$ = () => {
  return from(
    client.query({ query: CheckTokenDocument, fetchPolicy: "network-only" })
  ).pipe(
    handleGraphErrors(),
    map(({ data, errors }) => {
      return data.checkToken?.token
    }),
    tag("checkToken$")
  )
}

// NOTE: emits null until token set
export const me$ = token$.pipe(
  switchMap((token) => {
    if (!token) return of(null)
    return zenToRx(client.watchQuery({ query: MeDocument })).pipe(
      handleGraphErrors(),
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
          if (error) throw error
          return data.me
        }
      ),
      filter(isNotNullish),
      tag("watchQuery(me)")
    )
  }),
  makeUnrecoverable(),
  tag("me$"),
  shareLatest()
)

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
    handleGraphErrors(),
    map(({ data, errors, extensions, context }) => {
      return data!.trackEvent!
    }),
    tag("track$")
  )
}

export const contacts$ = token$.pipe(
  switchMap((token) => {
    if (!token) return of(null)
    return zenToRx(
      client.watchQuery({
        query: ContactsDocument,
        fetchPolicy: "network-only",
      })
    ).pipe(
      handleGraphErrors(),
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
          return data.contacts
        }
      ),
      filter(isNotNullish),
      tag("watchQuery(contacts)")
    )
  }),
  makeUnrecoverable(),
  tag("contacts$"),
  filter(isNotNullish),
  shareLatest()
)

export const refetchContacts = () =>
  client.refetchQueries({
    include: [ContactsDocument],
  })

export const upsertConversation$ = (input: ConversationInput) => {
  return from(
    client.mutate({
      mutation: UpsertConversationDocument,
      variables: { input },
      refetchQueries: [{ query: GetConversationsDocument }],
    })
  ).pipe(
    handleGraphErrors(),
    map(({ data, errors, extensions, context }) => {
      const { userError, conversation } = data!.upsertConversation!
      return userError ? new Err(userError) : new Ok(conversation!)
    }),
    tag("upsertConversation$")
  )
}

export const deleteConversation$ = (input: DeleteConversationInput) => {
  return from(
    client.mutate({
      mutation: DeleteConversationDocument,
      variables: { input },
      refetchQueries: [{ query: GetConversationsDocument }],
    })
  ).pipe(
    handleGraphErrors(),
    map(({ data, errors, extensions, context }) => {
      const { userError, conversation } = data!.deleteConversation!
      return userError ? new Err(userError) : new Ok(conversation!)
    }),
    tag("deleteConversation$")
  )
}

export const signConversation$ = (input: SignInput) => {
  return from(
    client.mutate({
      mutation: SignConversationDocument,
      variables: { input },
      refetchQueries: [
        { query: GetConversationsDocument },
        { query: ContactsDocument },
        { query: GetOppsDocument },
      ],
    })
  ).pipe(
    handleGraphErrors(),
    map(({ data, errors, extensions, context }) => {
      const { userError, conversation } = data!.sign!
      return userError ? new Err(userError) : new Ok(conversation!)
    }),
    tag("signConversation$")
  )
}

export const proposeConversation$ = (input: ProposeInput) => {
  return from(
    client.mutate({
      mutation: ProposeConversationDocument,
      variables: { input },
      refetchQueries: [{ query: GetConversationsDocument }],
    })
  ).pipe(
    handleGraphErrors(),
    map(({ data, errors, extensions, context }) => {
      const { userError, conversation } = data!.propose!
      return userError ? new Err(userError) : new Ok(conversation!)
    }),
    tag("proposeConversation$")
  )
}

export const reviewConversation$ = (input: ReviewInput) => {
  return from(
    client.mutate({
      mutation: ReviewConversationDocument,
      variables: { input },
      refetchQueries: [
        { query: GetConversationsDocument },
        { query: ContactsDocument },
      ],
    })
  ).pipe(
    handleGraphErrors(),
    map(({ data, errors, extensions, context }) => {
      const { userError, conversation } = data!.review!
      return userError ? new Err(userError) : new Ok(conversation!)
    }),
    tag("reviewConversation$")
  )
}

export const getConversation$ = (id: string) => {
  return from(
    client.query({
      query: ViewConversationDocument,
      variables: { id },
      fetchPolicy: "network-only",
    })
  ).pipe(
    handleGraphErrors(),
    map(({ data }) => {
      const { userError, conversation } = data!.getConversation!
      return userError ? new Err(userError) : new Ok(conversation!)
    }),
    makeUnrecoverable(),
    tag("getConversation$")
  )
}

export const subscribeConversation$ = (input: ConversationChangedInput) =>
  from(
    zenToRx(
      client.subscribe({
        query: ConversationChangedDocument,
        variables: { input },
        fetchPolicy: "no-cache",
      })
    )
  ).pipe(
    handleGraphErrors(),
    map(({ data }) => data?.conversationChanged),
    filter(isNotNullish),
    makeUnrecoverable(),
    tag("subscribeConversation$")
  )

export const conversations$ = token$.pipe(
  filter(isNotNullish),
  switchMap((token) => {
    return zenToRx(
      client.watchQuery({
        query: GetConversationsDocument,
        fetchPolicy: "network-only",
      })
    ).pipe(
      handleGraphErrors(),
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
          if (error) throw error
          return data.getConversations?.conversations
        }
      ),
      filter(isNotNullish),
      tag("watchQuery(conversations) > filter(isNotNullish)")
    )
  }),
  map((conversations) =>
    pipe(
      conversations,
      _filter((c) => c.status !== ConversationStatus.Deleted),
      sort((c) => c.occurredAt),
      reverse()
    )
  ),
  makeUnrecoverable(),
  tag("conversations$"),
  shareLatest()
)

// TODO: dedupe w/ convos$
export const opps$ = token$.pipe(
  filter(isNotNullish),
  switchMap((token) => {
    return zenToRx(
      client.watchQuery({
        query: GetOppsDocument,
        fetchPolicy: "network-only",
      })
    ).pipe(
      handleGraphErrors(),
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
          if (error) throw error
          return data.getOpps!.opps
        }
      ),
      filter(isNotNullish)
    )
  }),
  tag("opps$"),
  makeUnrecoverable(),
  shareLatest()
)

export const upsertOpp$ = (input: OppInput) => {
  return from(
    client.mutate({
      mutation: UpsertOppDocument,
      variables: { input },
      refetchQueries: [{ query: GetOppsDocument }],
    })
  ).pipe(
    handleGraphErrors(),
    map(({ data, errors, extensions, context }) => {
      const { userError, opp } = data!.upsertOpp!
      return userError ? new Err(userError) : new Ok(opp)
    }),
    tag("upsertConversation$")
  )
}

export const getOpp$ = (id: string) => {
  return from(
    client.query({
      query: GetOppDocument,
      variables: { id },
      fetchPolicy: "network-only",
    })
  ).pipe(
    handleGraphErrors(),
    map(({ data }) => {
      const { userError, opp } = data!.getOpp!
      return userError ? new Err(userError) : new Ok(opp!)
    }),
    makeUnrecoverable(),
    tag("getOpp$")
  )
}

export const getTimeline$ = (input: TimelineInput = {}) =>
  from(
    client.query({
      query: GetTimelineDocument,
      fetchPolicy: "network-only",
      variables: { input },
    })
  ).pipe(
    handleGraphErrors(),
    map(({ data }) => {
      const { events } = data.getTimeline!
      return new Ok(events)
    }),
    resultMap((events) =>
      pipe(
        events,
        sort((e) => e.occurredAt),
        reverse()
      )
    ),
    makeUnrecoverable(),
    tag("getTimeline$")
  )

export const subscribeTimeline$ = (input: TimelineEventsAddedInput) =>
  from(
    zenToRx(
      client.subscribe({
        query: TimelineEventsAddedDocument,
        variables: { input },
        fetchPolicy: "no-cache",
      })
    )
  ).pipe(
    tag("THIS"),
    handleGraphErrors(),
    map(({ data }) => data?.timelineEventsAdded),
    filter(isNotNullish),
    makeUnrecoverable(),
    tag("subscribeTimeline$")
  )

export const getProfile$ = (input: GetProfileInput) =>
  from(
    client.query({
      query: GetProfileDocument,
      variables: { input },
      fetchPolicy: "network-only",
    })
  ).pipe(
    handleGraphErrors(),
    map(({ data }) => {
      const profile = data.getProfile!.profile!
      return Ok(profile)
    }),
    makeUnrecoverable(),
    tag("getProfile$")
  )

export const patchProfile$ = (input: PatchProfileInput) =>
  from(
    client.mutate({
      mutation: PatchProfileDocument,
      variables: { input },
      refetchQueries: [{ query: MeDocument }],
    })
  ).pipe(
    handleGraphErrors(),
    map(({ data, errors, extensions, context }) => {
      const { userError, profile } = data!.patchProfile!
      return userError ? new Err(userError) : new Ok(profile!)
    }),
    tag("updateProfile$")
  )

export const updateProfile$ = (input: UpdateProfileInput) => {
  return from(
    client.mutate({
      mutation: UpdateProfileDocument,
      variables: { input },
      refetchQueries: [{ query: GetConversationsDocument }],
    })
  ).pipe(
    handleGraphErrors(),
    map(({ data, errors, extensions, context }) => {
      const { userError, profile } = data!.updateProfile!
      return userError ? new Err(userError) : new Ok(profile!)
    }),
    tag("upsertConversation$")
  )
}

// TODO: dedupe w/ convos$/opps$
export const profile$ = me$.pipe(
  switchMap((me) => {
    if (!me) return EMPTY
    if (!isAuthenticated(me)) return EMPTY
    if (!hasAllRequiredProfileProps(me)) return EMPTY
    const { id } = me
    return merge(
      getProfile$({ id }),
      subscribeTimeline$({ id }).pipe(
        debounceTime(500),
        switchMap((_) => getProfile$({ id }))
      )
    )
  }),
  filterResultOk(),
  makeUnrecoverable(),
  tag("profile$"),
  shareLatest()
)
