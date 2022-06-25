import { h, ReactSource } from "@cycle/react"
import {
  combineLatest,
  distinctUntilChanged,
  EMPTY,
  map,
  merge,
  mergeMap,
  of,
  pluck,
  share,
  shareReplay,
  skipUntil,
  startWith,
  switchMap,
  takeUntil,
} from "rxjs"
import { match } from "ts-pattern"
import { filterResultErr, filterResultOk } from "ts-results/rxjs-operators"
import {
  Contact,
  getConversation$,
  Invitee,
  Source as GraphSource,
  upsertConversation$,
} from "~/graph"
import { makeTagger } from "~/log"
import { error } from "~/notice"
import { Source as RouterSource } from "~/router"
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

  const id$ = history$.pipe(
    mergeMap((route) =>
      match(route)
        .with({ name: "editConversation" }, ({ params }) => of(params.id))
        .otherwise(() => EMPTY)
    ),
    distinctUntilChanged(),
    tag("id$"),
    shareReplay()
  )

  const getRecord$ = id$.pipe(
    switchMap((id) => getConversation$(id)),
    tag("getConversation$")
  )
  const record$ = getRecord$.pipe(filterResultOk())
  const userError$ = getRecord$.pipe(filterResultErr())

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
    shareReplay()
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
  const payload = combineLatest({ id: id$, invitees: invitees$ }).pipe(
    skipUntil(onSelect$), // TODO: until *any* form input changes
    tag("payload$"),
    share()
  )
  const response = payload.pipe(
    switchMap((input) => upsertConversation$(input)),
    tag("response")
  )
  const isSyncing$ = merge(
    payload.pipe(map((_) => true)),
    response.pipe(map((_) => false))
  ).pipe(startWith(false), tag("isSyncing"), shareReplay())

  const react = combineLatest({
    options: options$,
    selectedOptions: selectedOptions$,
    isSyncing: isSyncing$,
  }).pipe(map((valueProps) => h(View, { ...valueProps, onSelect })))
  const notice = userError$.pipe(
    map(({ message }) => error({ description: message }))
  )

  return {
    react,
    notice,
  }
}
