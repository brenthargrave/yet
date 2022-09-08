/* eslint @typescript-eslint/no-non-null-assertion: 0 */
/* eslint no-console: 0 */
/* eslint max-classes-per-file: 0 */

import { captureException } from "@sentry/react"
import { filter as _filter, pipe, reverse, sort } from "remeda"
import {
  BehaviorSubject,
  catchError,
  EMPTY,
  filter,
  from,
  map,
  merge,
  MonoTypeOperatorFunction,
  Observable,
  of,
} from "rxjs"
import { isNotNullish } from "rxjs-etc"
import { switchMap } from "rxjs/operators"
import { Err, Ok, Result } from "ts-results"
import { resultMap } from "ts-results/rxjs-operators"
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
  Customer,
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
  UserError,
  ViewConversationDocument,
} from "./generated"
import { client as urqlClient } from "./urql"

export { loggedIn, loggedOut } from "./driver"
export type { Commands, Source } from "./driver"
export * from "./generated"
export * from "./models"
export type ID = Scalars["ID"]

const tag = makeTagger("graph")

export class GraphError extends Error {}
export class GraphDefaultQueryError extends GraphError {}

export function eatUnrecoverableError<T>(
  callback?: (error: Error, caught: Observable<T>) => void
): MonoTypeOperatorFunction<T> {
  return (source) =>
    source.pipe(
      catchError((error, caught$) => {
        if (callback) callback(error, caught$)
        // NOTE: graph watch errors are fatal, will loop indefinitely if resubscribed
        return error instanceof GraphDefaultQueryError
          ? EMPTY
          : caught$.pipe(tag("caught$"))
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
    throw new GraphDefaultQueryError(error.message)
  }),
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
    return zenToRx(
      client.watchQuery({
        query: ContactsDocument,
        fetchPolicy: "network-only",
      })
    ).pipe(
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
    throw new GraphDefaultQueryError(error.message)
  }),
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
    map(({ data, errors, extensions, context }) => {
      if (errors) throw new GraphError(JSON.stringify(errors))
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
    map(({ data, errors, extensions, context }) => {
      if (errors) throw new GraphError(JSON.stringify(errors))
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
    map(({ data, errors, extensions, context }) => {
      if (errors) throw new GraphError(JSON.stringify(errors))
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
    map(({ data, errors, extensions, context }) => {
      if (errors) throw new GraphError(JSON.stringify(errors))
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
    map(({ data, errors, extensions, context }) => {
      if (errors) throw new GraphError(JSON.stringify(errors))
      const { userError, conversation } = data!.review!
      return userError ? new Err(userError) : new Ok(conversation!)
    }),
    tag("reviewConversation$")
  )
}

export const getConversation$ = (id: string) => {
  return merge(
    from(
      client.query({
        query: ViewConversationDocument,
        variables: { id },
        fetchPolicy: "network-only",
      })
    ).pipe(
      map(({ data, errors }) => {
        if (errors) throw new GraphError(JSON.stringify(errors))
        return data
      })
    )
  ).pipe(
    map((data) => {
      const { userError, conversation } = data!.getConversation!
      return userError ? new Err(userError) : new Ok(conversation!)
    }),
    catchError((error, _caught$) => {
      console.error(error)
      throw new GraphDefaultQueryError(error.message)
    }),
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
    ).pipe(
      map((result) => {
        const { context, data, errors, extensions } = result
        if (errors) throw new GraphError(JSON.stringify(errors))
        return data
      })
    )
  ).pipe(
    map((data) => data?.conversationChanged),
    filter(isNotNullish),
    catchError((error, _caught$) => {
      console.error(error)
      throw new GraphDefaultQueryError(error.message)
    }),
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
      tag("watchQuery(conversations)"),
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
  catchError((error, _caught$) => {
    throw new GraphDefaultQueryError(error.message)
  }),
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
          return data.getOpps!.opps
        }
      ),
      filter(isNotNullish)
    )
  }),
  tag("opps$"),
  catchError((error, _caught$) => {
    throw new GraphDefaultQueryError(error.message)
  }),
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
    map(({ data, errors, extensions, context }) => {
      if (errors) throw new GraphError(JSON.stringify(errors))
      const { userError, opp } = data!.upsertOpp!
      return userError ? new Err(userError) : new Ok(opp)
    }),
    tag("upsertConversation$")
  )
}

export const getOpp$ = (id: string) => {
  return merge(
    from(
      client.query({
        query: GetOppDocument,
        variables: { id },
        fetchPolicy: "network-only",
      })
    ).pipe(
      map(({ data, errors }) => {
        if (errors) throw new GraphError(JSON.stringify(errors))
        return data
      })
    )
  ).pipe(
    map((data) => {
      const { userError, opp } = data!.getOpp!
      return userError ? new Err(userError) : new Ok(opp!)
    }),
    catchError((error, _caught$) => {
      console.error(error)
      throw new GraphDefaultQueryError(error.message)
    }),
    tag("getOpp$")
  )
}

export const getTimeline$ = (input: TimelineInput = {}) => {
  return merge(
    from(
      client.query({
        query: GetTimelineDocument,
        fetchPolicy: "network-only",
        variables: { input },
      })
    ).pipe(
      map(({ data, errors }) => {
        if (errors) throw new GraphError(JSON.stringify(errors))
        return data
      })
    )
  ).pipe(
    map((data) => {
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
    catchError((error, _caught$) => {
      console.error(error)
      throw new GraphDefaultQueryError(error.message)
    }),
    tag("getTimeline$")
  )
}

export const subscribeTimeline$ = (input: TimelineEventsAddedInput) =>
  from(
    zenToRx(
      client.subscribe({
        query: TimelineEventsAddedDocument,
        variables: { input },
        fetchPolicy: "no-cache",
      })
    ).pipe(
      map((result) => {
        const { context, data, errors, extensions } = result
        if (errors) throw new GraphError(JSON.stringify(errors))
        return data
      })
    )
  ).pipe(
    map((data) => data?.timelineEventsAdded),
    filter(isNotNullish),
    catchError((error, _caught$) => {
      console.error(error)
      throw new GraphDefaultQueryError(error.message)
    }),
    tag("subscribeTimeline$")
  )

export const getProfile$ = (input: GetProfileInput) => {
  return merge(
    from(
      client.query({
        query: GetProfileDocument,
        variables: { input },
        fetchPolicy: "network-only",
      })
    ).pipe(
      map(({ data, errors }) => {
        if (errors) throw new GraphError(JSON.stringify(errors))
        return data
      })
    )
  ).pipe(
    map((data) => {
      const profile = data!.getProfile!.profile!
      return Ok(profile)
    }),
    catchError((error, _caught$) => {
      console.error(error)
      throw new GraphDefaultQueryError(error.message)
    }),
    tag("getProfile$")
  )
}

export const patchProfile$ = (input: PatchProfileInput) =>
  from(
    client.mutate({
      mutation: PatchProfileDocument,
      variables: { input },
      refetchQueries: [{ query: MeDocument }],
    })
  ).pipe(
    map(({ data, errors, extensions, context }) => {
      if (errors) throw new GraphError(JSON.stringify(errors))
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
    map(({ data, errors, extensions, context }) => {
      if (errors) throw new GraphError(JSON.stringify(errors))
      const { userError, profile } = data!.updateProfile!
      return userError ? new Err(userError) : new Ok(profile!)
    }),
    tag("upsertConversation$")
  )
}

// TODO: dedupe w/ convos$/opps$
export const profile$ = me$.pipe(
  filter(isNotNullish),
  switchMap(({ id }) => {
    return from(
      zenToRx(
        client.watchQuery({
          query: GetProfileDocument,
          variables: { input: { id } },
          fetchPolicy: "network-only",
        })
      ).pipe(
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
            return data.getProfile!.profile
          }
        ),
        filter(isNotNullish)
      )
    )
  }),
  tag("profile$"),
  catchError((error, _caught$) => {
    throw new GraphDefaultQueryError(error.message)
  }),
  shareLatest()
)
