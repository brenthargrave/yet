import { h, ReactSource } from "@cycle/react"
import { eqBy, prop, unionWith } from "ramda"
import {
  combineLatest,
  distinctUntilChanged,
  EMPTY,
  map,
  merge,
  mergeMap,
  Observable,
  of,
  partition,
  pluck,
  shareReplay,
  skip,
  startWith,
  switchMap,
} from "rxjs"
import { match } from "ts-pattern"
import {
  filterResultErr,
  filterResultOk,
  resultMap,
  resultMapErr,
} from "ts-results/rxjs-operators"
import { isPresent } from "~/fp"
import {
  Contact,
  getConversation$,
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

export const Edit = (sources: Sources) => {
  const {
    graph: { contacts$ },
    router: { history$ },
  } = sources

  const id = history$.pipe(
    mergeMap((route) =>
      match(route)
        .with({ name: "editConversation" }, ({ params }) => of(params.id))
        .otherwise(() => EMPTY)
    ),
    distinctUntilChanged(),
    tag("id$")
  )

  const getConv$ = id.pipe(
    switchMap((id) => getConversation$(id)),
    tag("getConversation$")
  )
  const conversation$ = getConv$.pipe(filterResultOk())
  const userError$ = getConv$.pipe(filterResultErr())

  const savedInvitees$ = conversation$.pipe(
    pluck("invitees"),
    tag("savedInvitees$")
  )

  const { $: selections, cb: onSelect } =
    makeObservableCallback<ContactOption[]>()

  const value = selections.pipe(startWith([]), tag("value"), shareReplay())

  const options = combineLatest({
    contacts: contacts$,
    invitees: savedInvitees$,
  }).pipe(
    map(
      ({ contacts, invitees }) => contacts
      // unionWith(eqBy(prop("id")), contacts, invitees)
    ),
    startWith([]),
    tag("options"),
    shareReplay()
  )

  const invitees = value.pipe(
    map((selections) =>
      selections.map(({ label, value, __isNew__ }, idx, all) => {
        return { name: label, id: value }
      })
    ),
    tag(`invitees`)
  )

  const payload = combineLatest({ id, invitees }).pipe(
    skip(1), // skip initial load
    tag("payload$")
  )

  const response = payload.pipe(
    switchMap((input) => upsertConversation$(input)),
    tag("response")
  )

  const isSyncing = merge(
    payload.pipe(map((_) => true)),
    response.pipe(map((_) => false))
  ).pipe(startWith(false), tag("isSyncing"), shareReplay())

  const react = combineLatest({ options, value, isSyncing }).pipe(
    map((valueProps) => h(View, { ...valueProps, onSelect }))
  )
  const notice = userError$.pipe(
    map(({ message }) => error({ description: message }))
  )

  return {
    react,
    notice,
  }
}
