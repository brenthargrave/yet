import { h, ReactSource } from "@cycle/react"
import {
  combineLatest,
  EMPTY,
  map,
  merge,
  mergeMap,
  of,
  shareReplay,
  skip,
  startWith,
  switchMap,
} from "rxjs"
import { match } from "ts-pattern"
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
    router: { history$ },
  } = sources

  const id = history$.pipe(
    mergeMap((route) =>
      match(route)
        .with({ name: "editConversation" }, ({ params }) => of(params.id))
        .otherwise(() => EMPTY)
    ),
    tag("id$")
  )

  const conversation$ = id.pipe(
    // switchMap(id => graphQLResultHasError.)
    // TODO: graph.conversation$(id)
    tag("conversation$")
  )

  const options = contacts$.pipe(
    map((contacts) =>
      contacts.map(({ id, name }, idx, _) => {
        return { label: name, value: id }
      })
    ),
    tag("options"),
    shareReplay()
  )

  const { $: selections, cb: onSelect } =
    makeObservableCallback<ContactOption[]>()

  // TODO: set value on initial load
  const value = selections.pipe(startWith([]), tag("selections"), shareReplay())

  const invitees = value.pipe(
    map((selections) =>
      selections.map(({ label, value, __isNew__ }, idx, all) => {
        return { name: label, id: isPresent(__isNew__) ? null : value }
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

  return {
    react,
  }
}
