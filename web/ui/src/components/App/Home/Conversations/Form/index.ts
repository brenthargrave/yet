import { h, ReactSource } from "@cycle/react"
import {
  combineLatest,
  debounceTime,
  distinctUntilChanged,
  EMPTY,
  filter,
  map,
  merge,
  mergeMap,
  Observable,
  of,
  pluck,
  scan,
  share,
  startWith,
  switchMap,
  withLatestFrom,
} from "rxjs"
import { isNotNullish } from "rxjs-etc"
import { filterResultOk } from "ts-results/rxjs-operators"
import { and, map as _map, not, prop } from "~/fp"
import {
  Contact,
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
  proposeConversation$,
  Source as GraphSource,
  track$,
  upsertConversation$,
} from "~/graph"
import { makeTagger } from "~/log"
import { info } from "~/notice"
import { push, routes, routeURL, Source as RouterSource } from "~/router"
import { cb$, shareLatest } from "~/rx"
import { Option as ContactOption, SelectedOption, View } from "./View"

const contactsToOptions = (contacts: Contact[]): SelectedOption[] =>
  contacts.map(({ id, name }, idx, _) => {
    return { label: name, value: id }
  })
const inviteesToOptions = (invitees: Invitee[]): SelectedOption[] =>
  invitees.map(({ id, name }, idx, _) => {
    return { label: name, value: id }
  })

const optionsToInvitees = (options: ContactOption[]): Invitee[] =>
  options.map(({ label, value }) => {
    return { name: label, id: value }
  })

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

export const Form = (sources: Sources, tagPrefix?: string) => {
  const tag = makeTagger(`${tagPrefix}/Form`)

  const {
    graph: { contacts$ },
    props: { record$, id$ },
  } = sources

  // TODO: subscribe to signings, alert signed, update state

  const status$ = record$.pipe(
    pluck("status"),
    filter(isNotNullish),
    startWith(ConversationStatus.Draft),
    tag("status$"),
    shareLatest()
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

  const invitees$ = selectedOptions$.pipe(
    map(optionsToInvitees),
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

  const note$ = merge(recordNote$, onChangeNote$).pipe(
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

  const formChangeCount$ = formTouch$.pipe(
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
    withLatestFrom(id$),
    switchMap(([_, id]) => proposeConversation$({ id })),
    tag("propose$")
  )
  const trackPropose$ = propose$.pipe(
    filterResultOk(),
    switchMap(({ id }) =>
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

  const participantNames$ = invitees$.pipe(
    map(_map(prop("name"))),
    tag("participantNames$"),
    share()
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
  }).pipe(tag("props$"))

  const react = props$.pipe(
    map((valueProps) =>
      h(View, {
        ...valueProps,
        onSelect,
        onChangeNote,
        onClickBack,
        onClickDelete,
        onChangeOccurredAt,
        onClickPublish,
        onClosePublish,
        onShareURLCopied,
        onClickShare,
      })
    )
  )

  const router = merge(goToList$)
  const notice = merge(shareURLCopiedNotice$)
  const track = merge(trackPropose$)

  return {
    react,
    router,
    notice,
    track,
  }
}
