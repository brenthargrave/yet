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
import { isPresent } from "~/fp"
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

  // const isValid = value.pipe(map(isNotEmpty), tag("isValid"))
  // TODO: const isSyncable = any(invitees/participants || notes) fields populated.
  /*
  ? what if you try to remove invitees *after* it's saved?
  state: draft | deleted | cosigned (locked)
  problem - how protect note from deletion (or editing?) after sharing for
  cosignature? either:
  1) "lock" editing while in "review" state
  2) permit editing (even in realtime!), and only lock upon cosignature.
   - trouble w/ this approach? changes might slip by before hitting "cosign",
  but that feels silly - all doc review works w/ live editing. Benefit is,
  this permits live editing while in a private chat discussing it.
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
