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
  share,
  shareReplay,
  skipUntil,
  startWith,
  switchMap,
  takeUntil,
  withLatestFrom,
} from "rxjs"
import { match } from "ts-pattern"
import { Ok, Result } from "ts-results"
import { filterResultErr, filterResultOk } from "ts-results/rxjs-operators"
import { ulid } from "ulid"
import {
  Contact,
  Conversation,
  ErrorCode,
  getConversation$,
  Invitee,
  Source as GraphSource,
  upsertConversation$,
  UserError,
} from "~/graph"
import { makeTagger } from "~/log"
import { error } from "~/notice"
import { push, routes, Source as RouterSource } from "~/router"
import { makeObservableCallback } from "~/rx"
import { Option as ContactOption, SelectedOption, View } from "./View"

const tag = makeTagger("Conversation/Edit")

interface Sources {
  react: ReactSource
  router: RouterSource
  graph: GraphSource
}

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

export const Edit = (sources: Sources) => {
  const {
    graph: { contacts$ },
    router: { history$ },
  } = sources

  // const id$ = history$.pipe(
  //   mergeMap((route) =>
  //     match(route)
  //       .with({ name: routes.editConversation.name }, ({ params }) =>
  //         of(params.id)
  //       )
  //       .with({ name: routes.newConversation.name }, () => ulid())
  //       .otherwise(() => EMPTY)
  //   ),
  //   distinctUntilChanged(),
  //   tag("id$"),
  //   shareReplay()
  // )

  // const getRecord$ = id$.pipe(
  //   switchMap((id) => getConversation$(id)),
  //   tag("getConversation$")
  // )
  // const record$ = getRecord$.pipe(filterResultOk())

  const getRecord$: Observable<Result<Conversation, UserError>> = history$.pipe(
    switchMap((route) =>
      match(route)
        .with({ name: routes.editConversation.name }, ({ params }) =>
          getConversation$(params.id)
        )
        .with({ name: routes.newConversation.name }, () =>
          // NOTE: generate empty seed record
          of(Ok({ id: ulid(), invitees: [], note: null }))
        )
        .otherwise(() => EMPTY)
    ),
    tag("getRecord$"),
    share()
  )
  const record$ = getRecord$.pipe(filterResultOk(), tag("record$"), share())
  const userError$ = getRecord$.pipe(filterResultErr())
  const redirectNotFound$ = userError$.pipe(
    filter(({ code }) => code === ErrorCode.NotFound),
    map((_) => push(routes.conversations()))
  )
  const id$ = record$.pipe(pluck("id"), tag("id$"), share())

  const recordInvitees$ = record$.pipe(pluck("invitees"))
  const inviteesAsOptions$ = recordInvitees$.pipe(
    map(inviteesToOptions),
    tag("inviteesAsOptions$"),
    share()
  )

  const { $: _onSelect$, cb: onSelect } =
    makeObservableCallback<ContactOption[]>()
  const onSelect$ = _onSelect$.pipe(tag("onSelect$"), share())

  const selectedOptions$ = merge(
    inviteesAsOptions$.pipe(takeUntil(onSelect$)),
    onSelect$
  ).pipe(tag("selectedOptions$"), share())

  const options$ = contacts$.pipe(
    map(contactsToOptions),
    startWith([]),
    tag("options$"),
    share()
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
  //   shareReplay()
  // )

  const invitees$ = selectedOptions$.pipe(
    map(optionsToInvitees),
    tag("invitees$")
  )

  const recordNote$ = record$.pipe(pluck("note"), tag("recordNote$"))
  const { $: _onChangeNote$, cb: onChangeNote } =
    makeObservableCallback<string>()
  const onChangeNote$ = _onChangeNote$.pipe(tag("_onChangeNote$$"), share())

  const note$ = merge(
    recordNote$.pipe(takeUntil(onChangeNote$)),
    onChangeNote$
  ).pipe(distinctUntilChanged(), tag("note$"), share())

  const payload$ = combineLatest({
    id: id$,
    invitees: invitees$.pipe(skipUntil(onSelect$)),
    note: note$.pipe(skipUntil(onChangeNote$)),
  }).pipe(debounceTime(1000), tag("payload$"), share())

  const response$ = payload$.pipe(
    switchMap((input) => upsertConversation$(input)),
    tag("response")
  )

  const isSyncing$ = merge(
    payload$.pipe(map((_) => true)),
    response$.pipe(map((_) => false))
  ).pipe(startWith(false), tag("isSyncing$"), share())

  const react = combineLatest({
    options: options$,
    selectedOptions: selectedOptions$,
    isSyncing: isSyncing$,
    note: note$,
  }).pipe(
    tag("combineLatest"),
    map((valueProps) => h(View, { ...valueProps, onSelect, onChangeNote }))
  )

  const notice = userError$.pipe(
    map(({ message }) => error({ description: message }))
  )

  const router = merge(redirectNotFound$)

  return {
    react,
    notice,
    router,
  }
}
