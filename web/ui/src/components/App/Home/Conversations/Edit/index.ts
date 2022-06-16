import { h, ReactSource } from "@cycle/react"
import {
  combineLatest,
  map,
  Observable,
  of,
  shareReplay,
  startWith,
} from "rxjs"
import { isNotNullish } from "rxjs-etc"
import { isNotEmpty, isPresent } from "~/fp"
import { Contact, Source as GraphSource } from "~/graph"
import { makeTagger } from "~/log"
import { Source as RouterSource } from "~/router"
import { makeObservableCallback } from "~/rx"
import { View, Option as ContactOption } from "./View"

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
  const value = _selections$.pipe(
    startWith([]),
    tag("selections$"),
    shareReplay()
  )

  // TODO: how to set value on load
  const participants$ = value.pipe(
    map((selections) => {
      return selections.map(({ label, value, __isNew__ }, idx, all) => {
        return isPresent(__isNew__)
          ? { name: label, isNew: true }
          : { name: label, isNew: false, id: value }
      })
      // selection -> contacts
      // how to flat *new* contacts?
      // ? if you're not going to join, why bother recording User ids?
      // existing?
    })
  )

  // const isValid = value.pipe(map(isNotEmpty), tag("isValid"))

  const react = combineLatest({ options, value }).pipe(
    map((valueProps) => h(View, { ...valueProps, onSelect }))
  )

  return {
    react,
  }
}
