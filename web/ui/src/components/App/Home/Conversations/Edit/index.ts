import { h, ReactSource } from "@cycle/react"
import { combineLatest, map, shareReplay, startWith } from "rxjs"
import { isPresent } from "~/fp"
import { Source as GraphSource } from "~/graph"
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

  const participants$ = value.pipe(
    map((selections) => {
      return selections.map(({ label, value, __isNew__ }, idx, all) => {
        return isPresent(__isNew__)
          ? { name: label, isNew: true }
          : { name: label, isNew: false, id: value }
      })
    })
  )

  // TODO: sync w/ API, locally.
  // const req$ = graph.updateConversation()
  // ? per-attribute updates, or a single update w/ nullable fields?
  // updateConversationParticipants

  // const isValid = value.pipe(map(isNotEmpty), tag("isValid"))

  const react = combineLatest({ options, value }).pipe(
    map((valueProps) => h(View, { ...valueProps, onSelect }))
  )

  return {
    react,
  }
}
