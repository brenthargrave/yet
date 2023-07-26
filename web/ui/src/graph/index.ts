/* eslint @typescript-eslint/no-non-null-assertion: 0 */
/* eslint no-console: 0 */
/* eslint max-classes-per-file: 0 */

import {
  FetchPolicy,
  RefetchQueriesInclude,
  RefetchQueryDescriptor,
} from "@apollo/client"
import { TypedDocumentNode } from "@graphql-typed-document-node/core"
import {
  addBreadcrumb,
  captureException,
  setUser,
  Severity,
  User as SentryUser,
} from "@sentry/react"
import { GraphQLError } from "graphql"
import { first } from "remeda"
import {
  BehaviorSubject,
  catchError,
  debounceTime,
  distinctUntilChanged,
  EMPTY,
  filter,
  from,
  map,
  merge,
  MonoTypeOperatorFunction,
  Observable,
  of,
  share,
  tap,
} from "rxjs"
import { isNotNullish } from "rxjs-etc"
import { switchMap } from "rxjs/operators"
import { match } from "ts-pattern"
import { Err, Ok, Result } from "ts-results"
import { filterResultOk } from "ts-results/rxjs-operators"
import { isNotEmpty } from "~/fp"
import { makeTagger } from "~/log"
import { shareLatest, zenToRx } from "~/rx"
import { getId } from "./anon"
import { client, tokenCacheKey } from "./apollo"
import {
  CheckTokenDocument,
  ContactsDocument,
  Conversation,
  ConversationChangedDocument,
  ConversationChangedInput,
  ConversationInput,
  DeleteConversationDocument,
  DeleteConversationInput,
  ErrorCode,
  Exact,
  GetConversationsDocument,
  GetMentionsDocument,
  GetOppProfileDocument,
  GetOppProfileInput,
  GetOppsDocument,
  GetPaymentDocument,
  GetPaymentInput,
  GetProfileDocument,
  GetProfileInput,
  GetTimelineDocument,
  MakeOptional,
  MeDocument,
  MentionsInput,
  OnboardingProfile,
  OppInput,
  PatchProfileDocument,
  PatchProfileInput,
  PatchProfileMutation,
  Platform,
  Profile,
  ProposeConversationDocument,
  ProposeInput,
  ReviewConversationDocument,
  ReviewInput,
  Scalars,
  SettingsEventKind,
  SignConversationDocument,
  SignInput,
  SubmitCodeDocument,
  SubmitCodeInput,
  SubmitCodeMutation,
  SubmitCodePayload,
  SubmitPhoneDocument,
  SubmitPhoneInput,
  SubmitPhoneMutation,
  TimelineEventsAddedDocument,
  TimelineEventsAddedInput,
  TimelineFilters,
  TimelineInput,
  TrackEventDocument,
  TrackEventInput,
  UnsubscribeDocument,
  UnsubscribeInput,
  UpdateProfileDocument,
  UpdateProfileInput,
  UpsertConversationDocument,
  UpsertOppDocument,
  UpsertPaymentDocument,
  UpsertPaymentInput,
  Verification,
  ViewConversationDocument,
  ViewConversationQuery,
  ViewConversationQueryVariables,
} from "./generated"
import { hasAllRequiredProfileProps, isAuthenticated } from "./models"

export { loggedIn, loggedOut } from "./driver"
export type { Commands, Source } from "./driver"
export * from "./generated"
export * from "./models"
export type ID = Scalars["ID"]

const tag = makeTagger("graph")

// NOTE: refs
// https://engineering.udacity.com/handling-errors-like-a-pro-in-typescript-d7a314ad4991
export class BaseError extends Error {}
export class UserError extends BaseError {
  message: string

  code?: ErrorCode

  cause?: Error | undefined

  constructor(message: string, code?: ErrorCode, cause?: Error) {
    super()
    this.code = code
    this.message = message
    this.cause = cause
  }
}
export class AppError extends BaseError {}
export class GraphError extends AppError {}

// ! TODO: drop
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
        const err = new UnrecoverableGraphError(error.message)
        err.cause = error
        throw error
      })
    )
}

const _handleApolloErrors = <T>(errors?: readonly GraphQLError[]) => {
  if (errors) {
    const error = first(errors)
    if (error) throw error
  }
}

const _handleGraphError = (error: Error) => {
  // NOTE: sentry all errors except UserError
  if (error instanceof UserError) {
    return of(Err(error))
  }
  captureException(error)
  return of(Err(error))
}

const mutate$ = <InputType, MutationType, ValueType>({
  input,
  mutation,
  getValue,
  refetchQueries,
}: {
  input: InputType
  mutation: TypedDocumentNode<MutationType, Exact<{ input: InputType }>>
  getValue: (data: MutationType) => ValueType
  refetchQueries?: RefetchQueriesInclude
}): Observable<Result<ValueType, Error>> =>
  from(
    client.mutate({
      mutation,
      variables: { input },
      refetchQueries,
    })
  ).pipe(
    map(({ errors, data /* context, extensions */ }) => {
      _handleApolloErrors<MutationType>(errors)
      if (!data) throw new GraphError("MIA data")
      return Ok(getValue(data))
    }),
    catchError((error, _caught$) => _handleGraphError(error))
  )

const query$ = <QueryType, QueryVariablesType, ValueType>({
  query,
  variables,
  getValue,
  fetchPolicy = "network-only",
}: {
  query: TypedDocumentNode<QueryType, QueryVariablesType>
  variables: QueryVariablesType
  getValue: (data: QueryType) => ValueType
  fetchPolicy?: FetchPolicy
}): Observable<Result<ValueType, Error>> =>
  from(
    client.query({
      query,
      variables,
      fetchPolicy,
    })
  ).pipe(
    map(({ errors, data /* context, extensions */ }) => {
      _handleApolloErrors(errors)
      if (!data) throw new GraphError("MIA data")
      return Ok(getValue(data))
    }),
    catchError((error, _caught$) => _handleGraphError(error))
  )

export const partitionError$ = (error$: Observable<Error>) => {
  const userError$ = error$.pipe(
    filter((error): error is UserError => error instanceof UserError),
    share()
  )
  const appError$ = error$.pipe(
    filter((error): error is Error => !(error instanceof UserError)),
    share()
  )
  return { userError$, appError$ }
}

export const submitPhone$ = (input: SubmitPhoneInput) =>
  mutate$<SubmitPhoneInput, SubmitPhoneMutation, Verification>({
    input,
    mutation: SubmitPhoneDocument,
    getValue: (data) => {
      return match(data.submitPhone)
        .with({ __typename: "Verification" }, (v) => v)
        .with({ __typename: "UserError" }, ({ message }) => {
          throw new UserError(message)
        })
        .run()
    },
  })

export const verifyCode$ = (input: SubmitCodeInput) =>
  mutate$<SubmitCodeInput, SubmitCodeMutation, SubmitCodePayload>({
    input,
    mutation: SubmitCodeDocument,
    getValue: (data) => {
      return match(data.submitCode)
        .with({ __typename: "SubmitCodePayload" }, (v) => v)
        .with({ __typename: "UserError" }, ({ message }) => {
          throw new UserError(message)
        })
        .run()
    },
  })

const token$$ = new BehaviorSubject<string | null>(
  localStorage.getItem(tokenCacheKey)
)

export const putTokenInSession = async (token: string) => {
  await fetch("/api/session_start", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      token,
    }),
  })
  return token
}

export const clearSession = async () =>
  fetch("/api/session_end", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  })

export const token$ = token$$.asObservable().pipe(tag("token$"), shareLatest())

// NOTE: workaround to sync token w/ local sessionStorage copy
// sync local token w/ session on every signin / reload
// ! TODO: find a more reliable session/localStorage sync strategy
token$
  .pipe(
    filter(isNotNullish),
    distinctUntilChanged(),
    tap((token) => from(putTokenInSession(token)))
  )
  .subscribe()

export const setToken = (token: string | null | undefined) => {
  if (token) {
    localStorage.setItem(tokenCacheKey, token)
    token$$.next(token)
  } else {
    localStorage.clear()
    sessionStorage.clear() // token replicated to session for html/json html requests
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
      tap((me) => {
        // https://docs.sentry.io/platforms/javascript/enriching-events/identify-user
        const user: SentryUser = {
          id: me.id,
        }
        setUser(user)
      }),
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

export const track$ = (
  _input: Omit<TrackEventInput, "anonId" | "occurredAt">
) => {
  const occurredAt = new Date().toISOString()
  const { properties } = _input
  const input = {
    ..._input,
    anonId,
    occurredAt,
    properties: {
      ...properties,
      platform: Platform.Web,
    },
  }
  addBreadcrumb({
    level: Severity.Info,
    category: "analytics",
    message: input.name,
    data: properties,
    timestamp: Date.now(),
  })
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

export const getConversation$ = (id: string) =>
  query$<ViewConversationQuery, ViewConversationQueryVariables, Conversation>({
    query: ViewConversationDocument,
    variables: { id },
    getValue: (data) => {
      const { userError, conversation } = data!.getConversation!
      if (userError) throw new UserError(userError.message)
      if (!conversation) throw new GraphError(`MIA conversation ${id}`)
      return conversation
    },
  }).pipe(tag("getConversation$"))

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
    tag("upsertOpp$")
  )
}

export const getOppProfile$ = (input: GetOppProfileInput) => {
  return from(
    client.query({
      query: GetOppProfileDocument,
      variables: { input },
      fetchPolicy: "network-only",
    })
  ).pipe(
    handleGraphErrors(),
    map(({ data }) => {
      const { userError, oppProfile } = data!.getOppProfile!
      return userError ? new Err(userError) : new Ok(oppProfile!)
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
    handleGraphErrors(),
    map(({ data }) => data?.timelineEventsAdded),
    filter(isNotNullish),
    makeUnrecoverable(),
    tag("subscribeTimeline$")
  )

export const getProfile$ = (input: GetProfileInput) =>
  zenToRx(
    client.watchQuery({
      query: GetProfileDocument,
      variables: { input },
      fetchPolicy: "no-cache",
    })
  ).pipe(
    handleGraphErrors(),
    map(
      ({ data, error, errors, loading, networkStatus, partial, ...result }) => {
        const profile = data.getProfile!.profile!
        return Ok(profile)
      }
    ),
    makeUnrecoverable(),
    tag("getProfile$")
  )

export const patchProfile$ = (input: PatchProfileInput) =>
  mutate$<PatchProfileInput, PatchProfileMutation, OnboardingProfile>({
    input,
    mutation: PatchProfileDocument,
    getValue: (data) => {
      return match(data.patchProfile)
        .with({ __typename: "OnboardingProfile" }, (v) => v)
        .with({ __typename: "UserError" }, ({ message }) => {
          throw new UserError(message)
        })
        .run()
    },
    refetchQueries: [MeDocument],
  })

export const updateProfile$ = (input: UpdateProfileInput) => {
  return from(
    client.mutate({
      mutation: UpdateProfileDocument,
      variables: { input },
      refetchQueries: [
        { query: GetConversationsDocument },
        // TODO: added to update profile/show after save in edit; shouldn't be necessary
        { query: MeDocument },
      ],
    })
  ).pipe(
    handleGraphErrors(),
    map(({ data, errors, extensions, context }) => {
      const { userError, profile } = data!.updateProfile!
      return userError ? new Err(userError) : new Ok(profile!)
    }),
    makeUnrecoverable(),
    tag("updateProfile$")
  )
}

// TODO: dedupe w/ convos$/opps$
export const profile$ = me$.pipe(
  switchMap((me) => {
    if (!me) return EMPTY
    if (!isAuthenticated(me)) return EMPTY
    if (!hasAllRequiredProfileProps(me)) return EMPTY
    const { id } = me
    const timelineFilters: TimelineFilters = { onlyWith: me.id }
    const profileInput: GetProfileInput = { id, timelineFilters }
    return merge(
      getProfile$(profileInput),
      subscribeTimeline$({ id }).pipe(
        debounceTime(500),
        switchMap((_) => getProfile$(profileInput))
      )
    )
  }),
  tag("profile$ switchMap"),
  filterResultOk(),
  makeUnrecoverable(),
  tag("profile$"),
  shareLatest()
)

export const getMentions$ = (input: MentionsInput) =>
  from(
    client.query({
      query: GetMentionsDocument,
      variables: { input },
    })
  ).pipe(
    handleGraphErrors(),
    map(({ data, errors }) => {
      const { mentions } = data!.mentions!
      return Ok(mentions)
    }),
    tag("upsertMentions$")
  )

export const oppsEnabled = false

export const getPayment$ = (input: GetPaymentInput, ignoreError = false) =>
  // from(
  //   client.query({
  //     query: GetPaymentDocument,
  //     variables: { input },
  //   })
  // )
  zenToRx(
    client.watchQuery({
      query: GetPaymentDocument,
      variables: { input },
    })
  ).pipe(
    handleGraphErrors(),
    map(({ data, errors }) => {
      const { payment } = data!.getPayment!
      return payment
    }),
    catchError((error, caught$) => {
      if (!ignoreError) throw error
      return of(null)
    }),
    makeUnrecoverable(),
    tag("getPayment$")
  )

export const upsertPayment$ = (input: UpsertPaymentInput) =>
  from(
    client.mutate({
      mutation: UpsertPaymentDocument,
      variables: { input },
      refetchQueries: [
        { query: GetPaymentDocument, variables: { input: { id: input.id } } },
      ],
    })
  ).pipe(
    handleGraphErrors(),
    map(({ data, errors }) => {
      const { userError, payment } = data!.upsertPayment!
      return userError ? new Err(userError) : new Ok(payment!)
    }),
    tag("getPayment$")
  )

export const unsubscribe$ = (
  _input: Omit<UnsubscribeInput, "occurredAt" | "kind">
) => {
  const occurredAt = new Date().toISOString()
  const kind: SettingsEventKind = SettingsEventKind.UnsubscribeDigest
  const input = {
    ..._input,
    occurredAt,
    kind,
  }
  return from(
    client.mutate({
      mutation: UnsubscribeDocument,
      variables: { input },
    })
  ).pipe(
    handleGraphErrors(),
    map(({ data, errors, extensions, context }) => {
      return data!.unsubscribe!
    }),
    makeUnrecoverable(),
    tag("unsubscribe$")
  )
}
