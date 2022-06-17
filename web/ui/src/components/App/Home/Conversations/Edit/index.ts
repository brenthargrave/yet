import { h, ReactSource } from "@cycle/react"
import {
  combineLatest,
  map,
  mapTo,
  shareReplay,
  startWith,
  switchMap,
  merge,
  share,
  filter,
} from "rxjs"
import { isNotEmpty, isPresent } from "~/fp"
import { Source as GraphSource, upsertConversation$ } from "~/graph"
import { makeTagger } from "~/log"
import { Source as RouterSource } from "~/router"
import { makeObservableCallback } from "~/rx"
import { Option as ContactOption, View } from "./View"

const tag = makeTagger("Conversation/Edit")

interface Sources {
  react: ReactSource
  router: RouterSource
  graph: GraphSource
}

export const Edit = (sources: Sources) => {
  const {
    graph: { contacts$ },
  } = sources

  const options = contacts$.pipe(
    map((contacts) =>
      contacts.map(({ id, name }, idx, _) => {
        return { label: name, value: id }
      })
    ),
    tag("options$"),
    shareReplay()
  )

  const { $: _selections$, cb: onSelect } =
    makeObservableCallback<ContactOption[]>()
  // TODO: set value on initial load
  const value = _selections$.pipe(
    startWith([]),
    tag("selections$"),
    shareReplay()
  )

  const invitees$ = value.pipe(
    map((selections) =>
      selections.map(({ label, value, __isNew__ }, idx, all) => {
        return { name: label, id: isPresent(__isNew__) ? null : value }
      })
    ),
    tag(`invitees$`)
  )

  const payload$ = combineLatest({ invitees: invitees$ }).pipe(tag("payload$"))

  const isValid = payload$.pipe(
    map(({ invitees }) => isNotEmpty(invitees)), // TODO: nor participants, notes
    tag("isValid")
  )

  /*
  state: draft | deleted | cosigned (locked, can't edit|delete)
   */

  const response$ = payload$.pipe(
    switchMap((input) => upsertConversation$(input)),
    tag("response$")
  )

  const isSyncing = merge(
    payload$.pipe(map((_) => true)),
    response$.pipe(map((_) => false))
  ).pipe(startWith(false), tag("isSyncing$"), shareReplay())

  const react = combineLatest({ options, value, isSyncing }).pipe(
    map((valueProps) => h(View, { ...valueProps, onSelect }))
  )

  return {
    react,
  }
}
