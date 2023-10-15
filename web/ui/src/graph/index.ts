/* eslint @typescript-eslint/no-non-null-assertion: 0 */
/* eslint no-console: 0 */
/* eslint max-classes-per-file: 0 */

import {
  addBreadcrumb,
  setUser,
  Severity,
  User as SentryUser,
} from "@sentry/react"
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
  Observable,
  of,
  share,
  startWith,
  tap,
} from "rxjs"
import { isNotNullish } from "rxjs-etc"
import { switchMap } from "rxjs/operators"
import { match } from "ts-pattern"
import { Err, Ok } from "ts-results"
import { filterResultOk } from "ts-results/rxjs-operators"
import { makeTagger } from "~/log"
import { shareLatest, zenToRx } from "~/rx"
import { getId } from "./anon"
import { client, tokenCacheKey } from "./apollo"
import {
  AnalyticsEvent,
  CheckTokenDocument,
  CheckTokenQuery,
  CheckTokenQueryVariables,
  ContactList,
  Conversation,
  ConversationChangedDocument,
  ConversationChangedInput,
  ConversationChangedSubscription,
  ConversationChangedSubscriptionVariables,
  ConversationInput,
  ConversationJoinedDocument,
  ConversationJoinedInput,
  ConversationJoinedSubscription,
  ConversationJoinedSubscriptionVariables,
  ConversationsPayload,
  CreateEventDocument,
  CreateEventInput,
  CreateEventMutation,
  Customer,
  DeleteConversationDocument,
  DeleteConversationInput,
  DeleteConversationMutation,
  DeleteNoteDocument,
  DeleteNoteInput,
  DeleteNoteMutation,
  GetContactsDocument,
  GetContactsQuery,
  GetContactsQueryVariables,
  GetConversationDocument,
  GetConversationQuery,
  GetConversationQueryVariables,
  GetConversationsDocument,
  GetConversationsQuery,
  GetConversationsQueryVariables,
  GetMentionsDocument,
  GetOppProfileDocument,
  GetOppProfileInput,
  GetOppsDocument,
  GetPaymentDocument,
  GetPaymentInput,
  GetProfileDocument,
  GetProfileInput,
  GetProfileQuery,
  GetProfileQueryVariables,
  GetTimelineDocument,
  GetTimelineQuery,
  GetTimelineQueryVariables,
  JoinConversationDocument,
  JoinConversationMutation,
  MeDocument,
  MentionsInput,
  MeQuery,
  MeQueryVariables,
  MuteProfileDocument,
  MuteProfileInput,
  MuteProfileMutation,
  Note,
  NoteAddedDocument,
  NoteAddedSubscription,
  NoteAddedSubscriptionVariables,
  NotedAddedInput,
  OnboardingProfile,
  OppInput,
  ParticipateInput,
  Participation,
  PatchProfileDocument,
  PatchProfileInput,
  PatchProfileMutation,
  Platform,
  PostNoteDocument,
  PostNoteInput,
  PostNoteMutation,
  Profile,
  ProfileExtended,
  ProposeConversationDocument,
  ProposeConversationMutation,
  ProposeInput,
  Scalars,
  SettingsEvent,
  SettingsEventKind,
  SubmitCodeDocument,
  SubmitCodeInput,
  SubmitCodeMutation,
  SubmitCodePayload,
  SubmitPhoneDocument,
  SubmitPhoneInput,
  SubmitPhoneMutation,
  TimelineEventsAddedDocument,
  TimelineEventsAddedInput,
  TimelineEventsAddedSubscription,
  TimelineEventsAddedSubscriptionVariables,
  TimelineFilters,
  TimelineInput,
  TimelinePayload,
  TokenPayload,
  UnsubscribeDocument,
  UnsubscribeInput,
  UnsubscribeMutation,
  UpdateProfileDocument,
  UpdateProfileInput,
  UpdateProfileMutation,
  UpsertConversationDocument,
  UpsertConversationMutation,
  UpsertNoteDocument,
  UpsertNoteInput,
  UpsertNoteMutation,
  UpsertOppDocument,
  UpsertPaymentDocument,
  UpsertPaymentInput,
  Verification,
} from "./generated"
import { hasAllRequiredProfileProps, isAuthenticated } from "./models"
import {
  handleUserError,
  mutate$,
  query$,
  subscribe$,
  UserError,
  watchQuery$,
} from "./operations"

export { loggedIn, loggedOut } from "./driver"
export type { Commands, Source } from "./driver"
export * from "./generated"
export * from "./models"
export { UserError } from "./operations"
export type ID = Scalars["ID"]

const tag = makeTagger("graph")

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
        .with({ __typename: "UserError" }, handleUserError)
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
        .with({ __typename: "UserError" }, handleUserError)
        .run()
    },
  })

export const upsertConversation$ = (input: ConversationInput) =>
  mutate$<ConversationInput, UpsertConversationMutation, Conversation>({
    input,
    mutation: UpsertConversationDocument,
    getValue: (data) => {
      return match(data.upsertConversation)
        .with({ __typename: "Conversation" }, (v) => v)
        .with({ __typename: "UserError" }, handleUserError)
        .run()
    },
    refetchQueries: [{ query: GetConversationsDocument }],
  })

export const deleteConversation$ = (input: DeleteConversationInput) =>
  mutate$<DeleteConversationInput, DeleteConversationMutation, Conversation>({
    input,
    mutation: DeleteConversationDocument,
    getValue: (data) => {
      return match(data.deleteConversation)
        .with({ __typename: "Conversation" }, (v) => v)
        .with({ __typename: "UserError" }, handleUserError)
        .run()
    },
  })

export const getConversation$ = (id: string) =>
  query$<GetConversationQuery, GetConversationQueryVariables, Conversation>({
    query: GetConversationDocument,
    variables: { id },
    getValue: (data) => {
      return match(data.getConversation)
        .with({ __typename: "Conversation" }, (v) => v)
        .with({ __typename: "UserError" }, handleUserError)
        .run()
    },
  })

export const proposeConversation$ = (input: ProposeInput) =>
  mutate$<ProposeInput, ProposeConversationMutation, Conversation>({
    input,
    mutation: ProposeConversationDocument,
    getValue: (data) => {
      return match(data.propose)
        .with({ __typename: "Conversation" }, (v) => v)
        .with({ __typename: "UserError" }, handleUserError)
        .run()
    },
    refetchQueries: [{ query: GetConversationsDocument }],
  })

export const joinConversation$ = (input: ParticipateInput) =>
  mutate$<ParticipateInput, JoinConversationMutation, Conversation>({
    input,
    mutation: JoinConversationDocument,
    getValue: (data) => {
      return match(data.participate)
        .with({ __typename: "Conversation" }, (v) => v)
        .with({ __typename: "UserError" }, handleUserError)
        .run()
    },
    refetchQueries: [
      { query: GetConversationsDocument },
      { query: GetContactsDocument },
    ],
  })

export const upsertNote$ = (input: UpsertNoteInput) =>
  mutate$<UpsertNoteInput, UpsertNoteMutation, Note>({
    input,
    mutation: UpsertNoteDocument,
    getValue: (data) => {
      return match(data.upsertNote)
        .with({ __typename: "Note" }, (v) => v)
        .with({ __typename: "UserError" }, handleUserError)
        .run()
    },
    // refetchQueries: [{ query: GetConversationDocument }],
  })

export const deleteNote$ = (input: DeleteNoteInput) =>
  mutate$<DeleteNoteInput, DeleteNoteMutation, Note>({
    input,
    mutation: DeleteNoteDocument,
    getValue: (data) => {
      return match(data.deleteNote)
        .with({ __typename: "Note" }, (v) => v)
        .with({ __typename: "UserError" }, handleUserError)
        .run()
    },
    refetchQueries: [{ query: GetConversationDocument }],
  })

export const postNote$ = (input: PostNoteInput) =>
  mutate$<PostNoteInput, PostNoteMutation, Note>({
    input,
    mutation: PostNoteDocument,
    getValue: (data) => {
      return match(data.postNote)
        .with({ __typename: "Note" }, (v) => v)
        .with({ __typename: "UserError" }, handleUserError)
        .run()
    },
    refetchQueries: [{ query: GetConversationDocument }],
  })

export const noteAdded$ = (input: NotedAddedInput) =>
  subscribe$<NoteAddedSubscription, NoteAddedSubscriptionVariables, Note>({
    query: NoteAddedDocument,
    variables: { input },
    getValue: (data) => {
      return match(data.noteAdded)
        .with({ __typename: "Note" }, (v) => v)
        .run()
    },
  })

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
    refetchQueries: [{ query: MeDocument }],
  })

export const getProfile$ = (input: GetProfileInput) =>
  watchQuery$<GetProfileQuery, GetProfileQueryVariables, ProfileExtended>({
    query: GetProfileDocument,
    variables: { input },
    getValue: (data) => {
      return match(data.getProfile)
        .with({ __typename: "ProfileExtended" }, (v) => v)
        .with({ __typename: "UserError" }, handleUserError)
        .run()
    },
  })

export const updateProfile$ = (input: UpdateProfileInput) =>
  mutate$<UpdateProfileInput, UpdateProfileMutation, ProfileExtended>({
    input,
    mutation: UpdateProfileDocument,
    getValue: (data) => {
      return match(data.updateProfile)
        .with({ __typename: "ProfileExtended" }, (v) => v)
        .with({ __typename: "UserError" }, handleUserError)
        .run()
    },
  })

export const mute$ = (input: MuteProfileInput) =>
  mutate$<MuteProfileInput, MuteProfileMutation, ProfileExtended>({
    input,
    mutation: MuteProfileDocument,
    getValue: (data) => {
      return match(data.muteProfile)
        .with({ __typename: "ProfileExtended" }, (v) => v)
        .with({ __typename: "UserError" }, handleUserError)
        .run()
    },
  })

// Timeline
//
export const getTimeline$ = (input: TimelineInput = {}) =>
  query$<GetTimelineQuery, GetTimelineQueryVariables, TimelinePayload>({
    query: GetTimelineDocument,
    variables: { input },
    getValue: (data) => {
      return match(data.getTimeline)
        .with({ __typename: "TimelinePayload" }, (v) => v)
        .run()
    },
  })

export const subscribeTimeline$ = (input: TimelineEventsAddedInput) =>
  subscribe$<
    TimelineEventsAddedSubscription,
    TimelineEventsAddedSubscriptionVariables,
    TimelinePayload
  >({
    query: TimelineEventsAddedDocument,
    variables: { input },
    getValue: (data) => {
      return match(data.timelineEventsAdded)
        .with({ __typename: "TimelinePayload" }, (v) => v)
        .run()
    },
  })

// Analytics
//

const anonId = getId()
export const track$ = (
  _input: Omit<CreateEventInput, "anonId" | "occurredAt">
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
  return mutate$<CreateEventInput, CreateEventMutation, AnalyticsEvent>({
    input,
    mutation: CreateEventDocument,
    getValue: (data) => {
      return match(data.createEvent)
        .with({ __typename: "AnalyticsEvent" }, (v) => v)
        .run()
    },
  })
}

// Auth
//

const token$$ = new BehaviorSubject<string | null>(
  localStorage.getItem(tokenCacheKey)
)

export const putTokenInSession = async (token: string) => {
  await fetch("/api/session_create", {
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
  fetch("/api/session_delete", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  })

export const token$ = token$$.asObservable().pipe(tag("token$"), shareLatest())

// NOTE: workaround to sync token w/ local sessionStorage copy
// sync local token w/ session on every signin / reload
// TODO: find a more reliable session/localStorage sync strategy
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

export const checkToken$ = () =>
  query$<CheckTokenQuery, CheckTokenQueryVariables, TokenPayload>({
    query: CheckTokenDocument,
    variables: {},
    getValue: (data) => {
      return match(data.checkToken)
        .with({ __typename: "TokenPayload" }, (v) => v)
        .run()
    },
  }).pipe(
    filterResultOk(),
    map((payload) => payload.token)
  )

// NOTE: emits null until token set
export const me$ = token$.pipe(
  switchMap((token) => {
    if (!token) return of(null)
    return watchQuery$<MeQuery, MeQueryVariables, Customer>({
      query: MeDocument,
      variables: {},
      getValue: (data) => {
        return match(data.me)
          .with({ __typename: "Customer" }, (v) => v)
          .run()
      },
    }).pipe(
      filterResultOk(),
      filter(isNotNullish),
      tap((me) => {
        // https://docs.sentry.io/platforms/javascript/enriching-events/identify-user
        const user: SentryUser = {
          id: me.id,
        }
        setUser(user)
      })
    )
  }),
  tag("me$"),
  shareLatest()
)

export const contacts$ = token$.pipe(
  switchMap((token) => {
    if (!token) return Err(new Error("MIA: token"))
    return watchQuery$<
      GetContactsQuery,
      GetContactsQueryVariables,
      ContactList
    >({
      query: GetContactsDocument,
      variables: {},
      getValue: (data) => {
        return match(data.getContacts)
          .with({ __typename: "ContactList" }, (v) => v)
          .run()
      },
    })
  }),
  filterResultOk(),
  map((list) => list.contacts),
  startWith([]),
  tag("contacts$"),
  shareLatest()
)

export const refetchContacts = () =>
  client.refetchQueries({
    include: [GetContactsDocument],
  })

export const subscribeConversation$ = (input: ConversationChangedInput) =>
  subscribe$<
    ConversationChangedSubscription,
    ConversationChangedSubscriptionVariables,
    Conversation
  >({
    query: ConversationChangedDocument,
    variables: { input },
    getValue: (data) => {
      return match(data.conversationChanged)
        .with({ __typename: "Conversation" }, (v) => v)
        .run()
    },
  })

export const conversationJoined$ = (input: ConversationJoinedInput) =>
  subscribe$<
    ConversationJoinedSubscription,
    ConversationJoinedSubscriptionVariables,
    Participation
  >({
    query: ConversationJoinedDocument,
    variables: { input },
    getValue: (data) => {
      return match(data.conversationJoined)
        .with({ __typename: "Participation" }, (v) => v)
        .run()
    },
  })

export const conversations$ = token$.pipe(
  filter(isNotNullish),
  switchMap((_token) =>
    watchQuery$<
      GetConversationsQuery,
      GetConversationsQueryVariables,
      ConversationsPayload
    >({
      query: GetConversationsDocument,
      variables: {},
      getValue: (data) => {
        return match(data.getConversations)
          .with({ __typename: "ConversationsPayload" }, (v) => v)
          .run()
      },
    }).pipe(
      filterResultOk(),
      map((payload) => payload.conversations),
      tag("conversations"),
      shareLatest()
    )
  )
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
  return mutate$<UnsubscribeInput, UnsubscribeMutation, SettingsEvent>({
    input,
    mutation: UnsubscribeDocument,
    getValue: (data) => {
      return match(data.unsubscribe)
        .with({ __typename: "SettingsEvent" }, (v) => v)
        .run()
    },
  }).pipe(
    //
    tag("unsubscribe$", false),
    share()
  )
}

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
        filterResultOk(),
        debounceTime(500),
        switchMap((_) => getProfile$(profileInput))
      )
    )
  }),
  filterResultOk(),
  tag("profile$", false),
  shareLatest()
)

// TODO: UNUSED, DEPRECATE
//

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
          if (error) throw error
          return data.getOpps!.opps
        }
      ),
      filter(isNotNullish)
    )
  }),
  tag("opps$"),
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
    map(({ data }) => {
      const { userError, oppProfile } = data!.getOppProfile!
      return userError ? new Err(userError) : new Ok(oppProfile!)
    }),
    tag("getOpp$")
  )
}

export const getMentions$ = (input: MentionsInput) =>
  from(
    client.query({
      query: GetMentionsDocument,
      variables: { input },
    })
  ).pipe(
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
    map(({ data, errors }) => {
      const { payment } = data!.getPayment!
      return payment
    }),
    catchError((error, caught$) => {
      if (!ignoreError) throw error
      return of(null)
    }),
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
    map(({ data, errors }) => {
      const { userError, payment } = data!.upsertPayment!
      return userError ? new Err(userError) : new Ok(payment!)
    }),
    tag("getPayment$")
  )
