import { h, ReactSource } from "@cycle/react"
import { combineLatest, map } from "rxjs"
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

  const { $: _createOption$, cb: onCreateOption } = makeObservableCallback(
    tag("createOption$")
  )
  const createOption$ = _createOption$.pipe(map((name) => console.debug(name)))

  // TODO: merge created option into options$
  const options$ = contacts$.pipe(
    map((contacts) =>
      contacts.map(({ id, name }, idx, _) => {
        return { label: name, value: id }
      })
    )
  )

  const onSelect = console.debug

  const react = combineLatest({ options: options$ }).pipe(
    map(({ options }) => h(View, { options, onSelect, onCreateOption }))
  )

  return {
    react,
  }
}
