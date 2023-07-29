import { h, ReactSource } from "@cycle/react"
import {
  combineLatest,
  debounceTime,
  distinctUntilChanged,
  distinctUntilKeyChanged,
  EMPTY,
  filter,
  map,
  merge,
  mergeMap,
  NEVER,
  Observable,
  of,
  pluck,
  scan,
  share,
  startWith,
  switchMap,
  tap,
  withLatestFrom,
} from "rxjs"
import { isNotNullish } from "rxjs-etc"
import { filterResultErr, filterResultOk } from "ts-results/rxjs-operators"
import { Source as ActionSource } from "~/action"
import { Notes } from "~/components/Notes"
import { map as _map, pluck as _pluck, prop } from "~/fp"
import {
  conversationJoined$,
  ConversationStatus,
  deleteConversation$,
  DraftConversation,
  EventName,
  hasBeenShared,
  isEditable,
  isValidConversation,
  isValidInviteeSet,
  justJoinedNotice,
  proposeConversation$,
  refetchContacts,
  Source as GraphSource,
  track$,
  upsertConversation$,
} from "~/graph"
import { makeTagger } from "~/log"
import { info } from "~/notice"
import { push, routes, routeURL, Source as RouterSource } from "~/router"
import { cb$, noticeFromError$, shareLatest } from "~/rx"
import { KeyCode, shortcut$ } from "~/system"
import { Mode, View } from "./View"
import { When } from "./When"
import { Who } from "./Who"

export { Mode }

interface Sources {
  react: ReactSource
  router: RouterSource
  graph: GraphSource
  action: ActionSource
  props: {
    id$: Observable<string>
    record$: Observable<DraftConversation>
    liveRecord$: Observable<DraftConversation>
  }
}

export const Form = (sources: Sources, _tagPrefix: string, mode: Mode) => {
  const tagPrefix = `${_tagPrefix}/Form`
  const tag = makeTagger(tagPrefix)

  const {
    graph: { me$ },
    props: { id$, record$: _record$, liveRecord$ },
    router: { history$ },
  } = sources

  const record$ = _record$.pipe(tag("record$"), shareLatest())
  const mergedRecord$ = merge(record$, liveRecord$).pipe(
    tag("mergedRecord$"),
    shareLatest()
  )
  const id = mergedRecord$.pipe(pluck("id"), tag("id"), shareLatest())

  const status$ = mergedRecord$.pipe(
    pluck("status"),
    filter(isNotNullish),
    startWith(ConversationStatus.Draft),
    distinctUntilChanged(),
    tag("status$"),
    shareLatest()
  )

  const isDisabledEditing$ = status$.pipe(
    map((status) => !isEditable(status)),
    startWith(false),
    tag("isDisabledEditing$")
  )

  const when = When(
    {
      ...sources,
      props: {
        record$: mergedRecord$,
        isDisabled$: isDisabledEditing$,
      },
    },
    tagPrefix
  )
  const { onChangeOccurredAt$, occurredAt$ } = when.value

  const who = Who(
    {
      ...sources,
      props: {
        record$: mergedRecord$,
        isDisabled$: isDisabledEditing$,
      },
    },
    tagPrefix
  )
  const { onSelect$, invitees$ } = who.value

  const formTouch$ = merge(
    //
    onChangeOccurredAt$,
    onSelect$
  ).pipe(tag("formTouch$"), share())

  const formChangeCount$ = merge(formTouch$).pipe(
    scan((acc, curr, idx) => acc + 1, 0),
    tag("formChangeCount$")
  )

  const payload$ = combineLatest({
    id: id$,
    occurredAt: occurredAt$,
    invitees: invitees$,
  }).pipe(tag("payload$"), shareLatest())

  const isValid$ = payload$.pipe(
    map(isValidConversation),
    startWith(false),
    distinctUntilChanged(),
    tag("isValid$"),
    shareLatest()
  )

  const request$ = combineLatest({
    payload: payload$,
    isValid: isValid$,
    changeCount: formChangeCount$,
  }).pipe(
    filter(({ changeCount }) => changeCount >= 1),
    mergeMap(({ payload, isValid }) => (isValid ? of(payload) : EMPTY)),
    debounceTime(500),
    tag("request$"),
    share()
  )

  const upsert$ = request$.pipe(
    switchMap((input) => upsertConversation$(input)),
    tag("upsert$"),
    share()
  )
  const conversation$ = upsert$.pipe(
    filterResultOk(),
    tag("conversation$"),
    share()
  )
  const upsertError$ = upsert$.pipe(
    filterResultErr(),
    tag("upsertError"),
    share()
  )
  const upsertNotice = noticeFromError$(upsertError$)

  // Delete
  //

  const [onClickBack, onClickBack$] = cb$(tag("onClickBack$"))
  const [onClickDelete, onClickDelete$] = cb$(tag("onClickDelete$"))

  const delete$ = merge(onClickDelete$).pipe(
    withLatestFrom(id$),
    switchMap(([_, id]) => deleteConversation$({ id })),
    tag("delete$"),
    share()
  )
  const deleted$ = delete$.pipe(filterResultOk(), tag("deleted$"), share())
  const deleteError$ = delete$.pipe(
    filterResultErr(),
    tag("deleteError$"),
    share()
  )
  const deleteNotice = noticeFromError$(deleteError$)
  const deleteTrack = deleted$.pipe(
    withLatestFrom(me$),
    mergeMap(([conversation, me]) =>
      track$({
        customerId: me?.id,
        name: EventName.DeleteConversation,
        properties: {
          conversationId: conversation.id,
        },
      })
    ),
    tag("deleteTrack"),
    share()
  )

  const isDeleting$: Observable<boolean> = merge(
    onClickDelete$.pipe(map((_) => true)),
    delete$.pipe(map((_) => false))
  ).pipe(
    startWith(false),
    distinctUntilChanged(),
    tag("isDeleting$"),
    shareLatest()
  )

  const isExposed$ = mergedRecord$.pipe(
    map(hasBeenShared),
    startWith(false),
    tag("isExposed$"),
    share()
  )

  const isDisabledDelete = combineLatest({
    isValid: isValid$,
    isDeleting: isDeleting$,
    isExposed: isExposed$,
  }).pipe(
    map(
      ({ isValid, isDeleting, isExposed }) =>
        // NOTE: only creator can delete
        !isValid || isDeleting || isExposed
    ),
    startWith(false),
    distinctUntilChanged(),
    tag("isDeleteDisabled$"),
    shareLatest()
  )

  // Invite

  // NOTE: can't invite until *persisted* record has valid invitees
  const isInvitable$ = mergedRecord$.pipe(
    map((record) => isValidInviteeSet(record.invitees)),
    startWith(false),
    distinctUntilChanged(),
    tag("isInvitable$"),
    shareLatest()
  )

  const hasInvited = mergedRecord$.pipe(
    map((record) => record.status !== ConversationStatus.Draft),
    startWith(false),
    tag("hasInvited"),
    shareLatest()
  )

  const goToList$ = merge(onClickBack$, deleted$).pipe(
    map((_) => push(routes.conversations())),
    share()
  )

  const [onClickInvite, onClickInvite$] = cb$(tag("onClickInvite$"))
  const [onCloseInvite, onCloseInvite$] = cb$(tag("onCloseInvite$"))

  const propose$ = onClickInvite$.pipe(
    withLatestFrom(record$),
    filter(([_, record]) => record.status === ConversationStatus.Draft),
    switchMap(([_, { id }]) => proposeConversation$({ id })),
    tag("propose$")
  )
  const proposeError$ = propose$.pipe(
    filterResultErr(),
    tag("proposeError$"),
    share()
  )
  const noticePropose = noticeFromError$(proposeError$).pipe(
    tag("proposeNotice"),
    share()
  )
  const trackPropose$ = onClickInvite$.pipe(
    withLatestFrom(id$, me$),
    switchMap(([_, id, me]) =>
      track$({
        customerId: me?.id,
        name: EventName.TapPropose,
        properties: {
          conversationId: id,
        },
      })
    ),
    tag("trackPropose$"),
    share()
  )

  const openShortcut$ = shortcut$([KeyCode.ControlLeft, KeyCode.KeyP])

  const isOpenInvite$ = merge(
    merge(openShortcut$, onClickInvite$).pipe(map((_) => true)),
    onCloseInvite$.pipe(map((_) => false))
  ).pipe(startWith(false), tag("isOpenInvite$"), shareLatest())

  const joinURL$ = id$.pipe(
    map((id) => routeURL(routes.joinConversation({ id }))),
    tag("shareURL$"),
    shareLatest()
  )

  const [onShareURLCopied, onShareURLCopied$] = cb$(tag("onShareURLCopied$"))
  const shareURLCopiedNotice$ = onShareURLCopied$.pipe(
    map((_) => info({ description: "Copied!" })),
    tag("shareURLCopiedNotice$"),
    share()
  )

  // TODO: dedupe w/ Show
  const [onClickShare, onClickShare$] = cb$(tag("onClickShare$"))
  const [onCloseShare, onCloseShare$] = cb$(tag("onCloseShare$"))
  const isOpenShare$ = merge(
    onClickShare$.pipe(map((_) => true)),
    onCloseShare$.pipe(map((_) => false))
  ).pipe(startWith(false), tag("isOpenShare$"), shareLatest())

  const showShare = mergedRecord$.pipe(
    map((record) => record.status === ConversationStatus.Joined),
    startWith(false),
    tag("showShare"),
    shareLatest()
  )

  const knownInvitees$ = invitees$.pipe(
    map((invitees) => invitees.filter((invitee) => invitee.isContact)),
    tag("knownInvitees$"),
    share()
  )
  const unknownInvitees$ = invitees$.pipe(
    map((invitees) => invitees.filter((invitee) => !invitee.isContact)),
    tag("unknownInvitees$"),
    share()
  )

  const inviteeNames$ = invitees$.pipe(
    map(_map(prop("name"))),
    tag("participantNames$"),
    share()
  )

  const justJoinedNotice$ = mergedRecord$.pipe(
    distinctUntilKeyChanged("id"),
    switchMap(({ id: conversationId }) =>
      conversationJoined$({ conversationId }).pipe(
        //
        filterResultOk()
      )
    ),
    withLatestFrom(me$),
    filter(([p, me]) => p.participant.id !== me?.id),
    tap((_) => refetchContacts()),
    map(([p, me]) => info({ description: justJoinedNotice(p) })),
    share()
  )

  const redirectJustJoinedToShow$ = justJoinedNotice$.pipe(
    withLatestFrom(id$),
    map(([_, id]) => push(routes.conversation({ id }))),
    tag("redirectJustJoinedToShow$"),
    share()
  )

  const notes = Notes(
    {
      ...sources,
      props: {
        conversation$: mergedRecord$,
      },
    },
    tagPrefix
  )

  const isSyncing = merge(
    request$.pipe(map((_) => true)),
    upsert$.pipe(map((_) => false)),
    notes.value.isSyncing
  ).pipe(
    startWith(false),
    distinctUntilChanged(),
    tag("isSyncing$"),
    shareLatest()
  )

  const props$ = combineLatest({
    isSyncing,
    status: status$,
    when: when.react,
    who: who.react,

    // delete
    isDeleting: isDeleting$,
    isDisabledDelete,

    // invite
    inviteeNames: inviteeNames$,
    isInvitable: isInvitable$,
    isOpenInvite: isOpenInvite$,
    knownInvitees: knownInvitees$,
    unknownInvitees: unknownInvitees$,
    joinURL: joinURL$,
    hasInvited,

    // share
    id,
    isOpenShare: isOpenShare$,
    showShare,

    // Notes
    notes: notes.react.view,
    addButton: notes.react.addButton,
  }).pipe(tag("props$"))

  const react = props$.pipe(
    map((props) =>
      h(View, {
        ...props,
        onClickBack,
        onClickInvite,
        onClickDelete,
        onCloseInvite,
        onShareURLCopied,
        onClickShare,
        onCloseShare,
      })
    ),
    tag("react")
  )

  const notice = merge(
    upsertNotice,
    deleteNotice,
    noticePropose,
    shareURLCopiedNotice$,
    justJoinedNotice$,
    notes.notice
  )
  const graph = merge(propose$)
  const action = merge(NEVER) // opps.action
  const track = merge(
    ..._pluck("track", [when, who, notes]),
    deleteTrack,
    trackPropose$
  )
  const router = merge(
    goToList$,
    redirectJustJoinedToShow$
    // Opps
    // showOpps$,
    // hideOpps$,
    // opps.router
  )

  return {
    react,
    router,
    notice,
    track,
    graph,
    action,
  }
}
