import { h, ReactSource } from "@cycle/react"
import { combineLatest, map, shareReplay, startWith } from "rxjs"
import { isNotEmpty } from "~/fp"
import { Source as GraphSource } from "~/graph"
import { makeTagger } from "~/log"
import { Source as RouterSource } from "~/router"
import { makeObservableCallback } from "~/rx"
import { View } from "./View"

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

  const { $: _selections$, cb: onSelect } = makeObservableCallback()
  const selections$ = _selections$.pipe(
    startWith([]),
    tag("selections$"),
    shareReplay()
  )

  const isValid = selections$.pipe(map(isNotEmpty), tag("isValid"))

  const react = combineLatest({ options, isValid }).pipe(
    map(({ options }) => h(View, { options, onSelect }))
  )

  return {
    react,
  }
}
