import { h, ReactSource } from "@cycle/react"
import { createRef } from "react"
import {
  combineLatest,
  debounceTime,
  distinctUntilChanged,
  EMPTY,
  filter,
  fromEvent,
  map,
  merge,
  mergeMap,
  Observable,
  of,
  pairwise,
  pluck,
  scan,
  share,
  startWith,
  switchMap,
  tap,
  withLatestFrom,
} from "rxjs"
import { isNotNullish } from "rxjs-etc"
import { filterResultOk } from "ts-results/rxjs-operators"
import { Main as Opps } from "~/components/App/Home/Opps"
import { and, includes, map as _map, not, pluck as _pluck, prop } from "~/fp"
import {
  Contact,
  Conversation,
  ConversationStatus,
  deleteConversation$,
  DraftConversation,
  EventName,
  hasBeenShared,
  Invitee,
  inviteesDiffer,
  isCompleteConversation,
  isStatusEditable,
  isValidConversation,
  justSignedNotice,
  oppEmbedText,
  proposeConversation$,
  refetchContacts,
  Source as GraphSource,
  subscribeConversation$,
  track$,
  upsertConversation$,
} from "~/graph"
import { makeTagger } from "~/log"
import { info } from "~/notice"
import {
  newConversationOppsRoutesGroup,
  push,
  routes,
  routeURL,
  Source as RouterSource,
} from "~/router"
import { cb$, mapTo, shareLatest } from "~/rx"
import { Option as ContactOption, SelectedOption, View } from "./View"

const noteInputRef = createRef<HTMLTextAreaElement>()

const contactsToOptions = (contacts: Contact[]): SelectedOption[] =>
  contacts.map(({ id, name }, idx, _) => {
    return { label: name, value: id }
  })
const inviteesToOptions = (invitees: Invitee[]): SelectedOption[] =>
  invitees.map(({ id, name }, idx, _) => {
    return { label: name, value: id }
  })

const optionsToInvitees = (
  options: ContactOption[],
  contacts: Contact[]
): Invitee[] => {
  const contactIds = _pluck("id", contacts)
  return options.map(({ label: name, value: id }) => {
    const isContact = includes(id, contactIds)
    return { name, id, isContact } as Invitee
  })
}

interface Props {
  id$: Observable<string>
  record$: Observable<DraftConversation>
}
interface Sources {
  react: ReactSource
  router: RouterSource
  graph: GraphSource
  props: Props
}

export const Form = (sources: Sources, _tagPrefix?: string) => {
  const tagPrefix = `${_tagPrefix}/Form`
  const tag = makeTagger(tagPrefix)

  const {
    graph: { contacts$ },
    props: { record$: _record$, id$ },
    router: { history$ },
  } = sources

  // Opps
  const [onClickAddOpp, onClickAddOpp$] = cb$(tag("onClickAddOpp$"))
  const [onCloseAddOpp, _onCloseAddOpp$] = cb$(tag("onCloseAddOpp$"))
  // TODO: why does ESC fail to close Opps modal but not Publish?
  const onEscape$ = fromEvent<KeyboardEvent>(document, "keydown").pipe(
    filter((e) => e.key === "Escape"),
    tag("escape$")
  )
  const onCloseAddOpp$ = merge(_onCloseAddOpp$, onEscape$)

  const opps = Opps(sources, tagPrefix)
  const {
    value: { embedOpp$ },
  } = opps

  const liveRecord$ = id$.pipe(
    switchMap((id) => subscribeConversation$({ id })),
    tag("liveRecord$"),
    shareLatest()
  )
  const record$ = merge(_record$, liveRecord$).pipe(
    tag("record$"),
    shareLatest()
  )

  const status$ = record$.pipe(
    pluck("status"),
    filter(isNotNullish),
    startWith(ConversationStatus.Draft),
    tag("status$"),
    shareLatest()
  )

  const justSignedNotice$ = record$.pipe(
    pairwise(),
    tag("justSignedNotice$ pairwise"),
    filter(
      ([prev, curr]) =>
        prev.status !== ConversationStatus.Signed &&
        curr.status === ConversationStatus.Signed
    ),
    map(([_prev, record]) =>
      info({ title: justSignedNotice(record as Conversation) })
    ),
    tag("justSignedNotice$"),
    tap((_) => refetchContacts()),
    share()
  )
  const redirectJustSignedToShow$ = justSignedNotice$.pipe(
    withLatestFrom(id$),
    map(([_, id]) => push(routes.conversation({ id }))),
    tag("redirectJustSigned$")
  )

  const recordInvitees$ = record$.pipe(pluck("invitees"))
  const recordInviteesAsOptions$ = recordInvitees$.pipe(
    map(inviteesToOptions),
    tag("recordInviteesAsOptions$"),
    shareLatest()
  )

  const [onSelect, onSelect$] = cb$<ContactOption[]>(tag("onSelect$"))

  const selectedOptions$ = merge(recordInviteesAsOptions$, onSelect$).pipe(
    tag("selectedOptions$"),
    shareLatest()
  )

  const options$ = contacts$.pipe(
    map(contactsToOptions),
    tag("options$"),
    shareLatest()
  )

  const invitees$ = combineLatest({
    options: selectedOptions$,
    contacts: contacts$,
  }).pipe(
    // @ts-ignore
    map(({ options, contacts }) => optionsToInvitees(options, contacts)),
    distinctUntilChanged(inviteesDiffer),
    tag("invitees$"),
    shareLatest()
  )

  const recordNote$ = record$.pipe(
    pluck("note"),
    tag("recordNote$"),
    shareLatest()
  )

  const [onChangeNote, onChangeNote$] = cb$<string>(tag("onChangeNote$"))

  const editedNote$ = merge(recordNote$, onChangeNote$).pipe(
    distinctUntilChanged(),
    tag("editedNote$"),
    shareLatest()
  )

  const noteWithEmbed$ = embedOpp$.pipe(
    withLatestFrom(editedNote$),
    map(([opp, note]) => {
      const noteText = note ?? ""
      const embedText = oppEmbedText(opp)
      const ele = noteInputRef.current
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const pos = ele?.selectionStart ?? 0
      const noteWithEmbed =
        noteText.slice(0, pos) + embedText + noteText.slice(pos)
      if (ele) ele.value = noteWithEmbed
      // NOTE: modal close loses textarea focus, fix:
      setTimeout(() => {
        if (ele) {
          ele.focus()
          ele.value = noteWithEmbed
          ele.selectionStart = pos
          ele.selectionEnd = pos
        }
      }, 400)
      return noteWithEmbed
    }),
    tag("noteWithEmbed$"),
    shareLatest()
  )

  const note$ = merge(editedNote$, noteWithEmbed$).pipe(
    distinctUntilChanged(),
    tag("note$"),
    shareLatest()
  )

  const [onChangeOccurredAt, onChangeOccurredAt$] = cb$<Date>(
    tag("onChangeOccurredAt$")
  )

  const recordOccurredAt$: Observable<Date> = record$.pipe(
    pluck("occurredAt"),
    distinctUntilChanged(),
    tag("recordOccurredAt$"),
    shareLatest()
  )

  const occurredAt$ = merge(recordOccurredAt$, onChangeOccurredAt$).pipe(
    distinctUntilChanged(),
    startWith(new Date()),
    tag("occurredAt$"),
    shareLatest()
  )

  const formTouch$ = merge(onSelect$, onChangeNote$, onChangeOccurredAt$).pipe(
    tag("formTouch$"),
    share()
  )

  const formChangeCount$ = merge(formTouch$, noteWithEmbed$).pipe(
    scan((acc, curr, idx) => acc + 1, 0),
    tag("formChangeCount$")
  )

  const payload$ = combineLatest({
    id: id$,
    invitees: invitees$,
    note: note$,
    occurredAt: occurredAt$,
  }).pipe(tag("payload$"), shareLatest())

  const isValid$ = payload$.pipe(
    map(isValidConversation),
    startWith(false),
    distinctUntilChanged(),
    tag("isValid$"),
    shareLatest()
  )

  const isComplete$ = payload$.pipe(
    map(isCompleteConversation),
    startWith(false),
    distinctUntilChanged(),
    tag("isComplete$"),
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

  const isSyncing$ = merge(
    formTouch$.pipe(map((_) => true)),
    upsert$.pipe(map((_) => false))
  ).pipe(
    startWith(false),
    distinctUntilChanged(),
    tag("isSyncing$"),
    shareLatest()
  )

  const [onClickBack, onClickBack$] = cb$(tag("onClickBack$"))
  const [onClickDelete, onClickDelete$] = cb$(tag("onClickDelete$"))

  const cleanupAbandedRecord$ = onClickBack$.pipe(
    withLatestFrom(isValid$),
    tag("withLatestFrom(isValid$)"),
    filter(([_, isValid]) => !isValid),
    tag("cleanupAbandedRecord$"),
    share()
  )

  const delete$ = merge(onClickDelete$, cleanupAbandedRecord$).pipe(
    withLatestFrom(id$),
    switchMap(([_, id]) => deleteConversation$({ id })),
    tag("delete$"),
    share()
  )
  const deleted$ = delete$.pipe(filterResultOk(), tag("deleted$"), share())

  const isDeleting$: Observable<boolean> = merge(
    onClickDelete$.pipe(map((_) => true)),
    delete$.pipe(map((_) => false))
  ).pipe(
    startWith(false),
    distinctUntilChanged(),
    tag("isDeleting$"),
    shareLatest()
  )

  const isExposed$ = record$.pipe(
    map(hasBeenShared),
    startWith(false),
    tag("isExposed$"),
    share()
  )

  const isDeleteDisabled$ = combineLatest({
    isValid: isValid$,
    isDeleting: isDeleting$,
    isExposed: isExposed$,
  }).pipe(
    map(
      ({ isValid, isDeleting, isExposed }) =>
        !isValid || isDeleting || isExposed
    ),
    startWith(false),
    distinctUntilChanged(),
    tag("isDeleteDisabled$"),
    shareLatest()
  )

  // NOTE: disable fields once cosigned
  const isDisabledEditing$ = status$.pipe(
    map((status) => !isStatusEditable(status)),
    startWith(false),
    tag("isDisabledEditing$")
  )

  const isPublishable$ = combineLatest({
    isDisabledEditing: isDisabledEditing$,
    isComplete: isComplete$,
  }).pipe(
    map(({ isComplete, isDisabledEditing }) =>
      and(isComplete, !isDisabledEditing)
    ),
    startWith(true),
    distinctUntilChanged(),
    tag("isPublishable$"),
    shareLatest()
  )
  const isPublishDisabled$ = isPublishable$.pipe(
    map(not),
    tag("isPublishDisabled$")
  )

  const goToList$ = merge(onClickBack$, deleted$).pipe(
    map((_) => push(routes.conversations())),
    share()
  )

  const [onClickPublish, onClickPublish$] = cb$(tag("onClickPublish$"))
  const [onClosePublish, onClosePublish$] = cb$(tag("onClosePublish$"))

  const propose$ = onClickPublish$.pipe(
    withLatestFrom(record$),
    tag("propose$ withLatestFrom"),
    filter(([_, record]) => record.status === ConversationStatus.Draft),
    switchMap(([_, { id }]) => proposeConversation$({ id })),
    tag("propose$")
  )
  const trackPropose$ = onClickPublish$.pipe(
    withLatestFrom(id$),
    switchMap(([_, id]) =>
      track$({
        name: EventName.TapPropose,
        properties: { conversation: id },
      })
    ),
    tag("trackPropose$"),
    share()
  )

  const isOpenPublish$ = merge(
    onClickPublish$.pipe(map((_) => true)),
    onClosePublish$.pipe(map((_) => false))
  ).pipe(startWith(false), tag("isOpenPublish$"), share())

  const shareURL$ = id$.pipe(
    map((id) => routeURL(routes.signConversation({ id }))),
    tag("shareURL$"),
    shareLatest()
  )

  const [onShareURLCopied, onShareURLCopied$] = cb$(tag("onShareURLCopied$"))
  const shareURLCopiedNotice$ = onShareURLCopied$.pipe(
    map((_) => info({ description: "Copied!" })),
    tag("shareURLCopiedNotice$")
  )

  const [onClickShare, onClickShare$] = cb$(tag("onClickShare$"))

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

  const participantNames$ = invitees$.pipe(
    map(_map(prop("name"))),
    tag("participantNames$"),
    share()
  )

  const showOpps$ = onClickAddOpp$.pipe(
    mapTo(push(routes.newConversationOpps())),
    tag("showOpp$"),
    share()
  )
  const hideOpps$ = merge(onCloseAddOpp$, noteWithEmbed$).pipe(
    mapTo(push(routes.newConversation())),
    tag("hideOpps$"),
    share()
  )
  const isOpenAddOpp$ = history$.pipe(
    map((route) => newConversationOppsRoutesGroup.has(route)),
    tag("isOpenAddOpp$"),
    startWith(false),
    share()
  )
  // const isOpenAddOpp$ = merge(
  //   onClickAddOpp$.pipe(mapTo(true)),
  //   merge(noteWithEmbed$, onCloseAddOpp$).pipe( mapTo(false))
  // ).pipe(tag("isOpenAddOpp$"), startWith(false), share())

  const router = merge(
    goToList$,
    redirectJustSignedToShow$,
    showOpps$,
    hideOpps$,
    opps.router
  )

  const props$ = combineLatest({
    options: options$,
    selectedOptions: selectedOptions$,
    isSyncing: isSyncing$,
    note: note$,
    isDeleting: isDeleting$,
    isDeleteDisabled: isDeleteDisabled$,
    occurredAt: occurredAt$,
    isPublishDisabled: isPublishDisabled$,
    isOpenPublish: isOpenPublish$,
    shareURL: shareURL$,
    participantNames: participantNames$,
    status: status$,
    isDisabledEditing: isDisabledEditing$,
    knownInvitees: knownInvitees$,
    unknownInvitees: unknownInvitees$,
    isOpenAddOpp: isOpenAddOpp$,
    oppsView: opps.react.pipe(tag("react")),
  }).pipe(tag("props$"))

  const react = props$.pipe(
    map((props) =>
      h(View, {
        ...props,
        onSelect,
        onChangeNote,
        onClickBack,
        onClickDelete,
        onChangeOccurredAt,
        onClickPublish,
        onClosePublish,
        onShareURLCopied,
        onClickShare,
        onClickAddOpp,
        onCloseAddOpp,
        noteInputRef,
      })
    )
  )
  const notice = merge(shareURLCopiedNotice$, justSignedNotice$, opps.notice)
  const track = merge(trackPropose$)
  const graph = merge(propose$)

  return {
    react,
    router,
    notice,
    track,
    graph,
  }
}
