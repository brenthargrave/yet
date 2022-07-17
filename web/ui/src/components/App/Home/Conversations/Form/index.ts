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
import { filterResultOk } from "ts-results/rxjs-operators"
import { not } from "~/fp"
import {
  Contact,
  Conversation,
  deleteConversation$,
  Invitee,
  inviteesDiffer,
  isCompleteConversation,
  isValidConversation,
  Source as GraphSource,
  upsertConversation$,
} from "~/graph"
import { makeTagger } from "~/log"
import { push, routes, Source as RouterSource } from "~/router"
import { callback$, cb$, shareLatest } from "~/rx"
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
  record$: Observable<Conversation>
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

  const recordInvitees$ = record$.pipe(pluck("invitees"))
  const recordInviteesAsOptions$ = recordInvitees$.pipe(
    map(inviteesToOptions),
    tag("recordInviteesAsOptions$"),
    shareLatest()
  )

  const { $: onSelect$, cb: onSelect } = callback$<ContactOption[]>(
    tag("onSelect$")
  )

  const selectedOptions$ = merge(recordInviteesAsOptions$, onSelect$).pipe(
    tag("selectedOptions$"),
    shareLatest()
  )

  const options$ = contacts$.pipe(
    map(contactsToOptions),
    tag("options$"),
    shareLatest()
  )
  // TODO: merge in prior selections
  //  combineLatest({
  //   contacts: contacts$.pipe(map(contactsToOptions)),
  //   invitees: inviteesAsOptions$,
  // }).pipe(
  //   map(({ contacts, invitees }) => {
  //     // @ts-ignore
  //     unionWith(eqBy(prop("id")), contacts, invitees)
  //   }),
  //   startWith([]),
  //   tag("options$"),
  //   share()
  // )

  const invitees$ = selectedOptions$.pipe(
    map(optionsToInvitees),
    distinctUntilChanged(inviteesDiffer),
    tag("invitees$"),
    shareLatest()
  )

  const recordNote$ = record$.pipe(
    pluck("note"),
    distinctUntilChanged(),
    tag("recordNote$"),
    shareLatest()
  )

  const { $: onChangeNote$, cb: onChangeNote } = callback$<string>(
    tag("onChangeNote$")
  )

  const note$ = merge(recordNote$, onChangeNote$).pipe(
    distinctUntilChanged(),
    tag("note$"),
    shareLatest()
  )

  const { $: onChangeOccurredAt$, cb: onChangeOccurredAt } = callback$<Date>(
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

  const { $: onClickBack$, cb: onClickBack } = callback$(tag("onClickBack$"))

  const { $: onClickDelete$, cb: onClickDelete } = callback$(
    tag("onClickDelete$")
  )

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

  const isDeleteDisabled$ = combineLatest({
    isValid: isValid$,
    isDeleting: isDeleting$,
  }).pipe(
    map(({ isValid, isDeleting }) => !isValid || isDeleting),
    startWith(false),
    distinctUntilChanged(),
    tag("isDeleteDisabled$"),
    shareLatest()
  )

  const isPublishable$ = combineLatest({
    isComplete: isComplete$,
  }).pipe(
    map(({ isComplete }) => isComplete),
    startWith(true),
    distinctUntilChanged(),
    tag("isPublishable$"),
    shareLatest()
  )
  const isPublishDisabled$ = isPublishable$.pipe(
    map((publishable) => not(publishable)),
    tag("isPublishDisabled$")
  )

  const goToList$ = merge(onClickBack$, deleted$).pipe(
    map((_) => push(routes.conversations())),
    share()
  )

  const [onClickPublish, onClickPublish$] = cb$(tag("onClickPublish$"))
  const [onClosePublish, onClosePublish$] = cb$(tag("onClosePublish$"))

  const isOpenPublish$ = merge(
    onClickPublish$.pipe(map((_) => true)),
    onClosePublish$.pipe(map((_) => false))
  ).pipe(startWith(true), tag("isOpenPublish$"), share())

  const shareURL$ = id$.pipe(
    map(
      (id) =>
        new URL(routes.showConversation({ id }).href, window.location.origin)
          .href
    ),
    tag("shareURL$"),
    shareLatest()
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
      })
    )
  )

  const router = merge(goToList$)

  return {
    react,
    router,
  }
}
