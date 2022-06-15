import { h, ReactSource } from "@cycle/react"
import { combineLatest, map } from "rxjs"
import { Source as GraphSource } from "~/graph"
import { makeTagger } from "~/log"
import { Source as RouterSource } from "~/router"
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

  const options$ = contacts$.pipe(
    map((contacts) =>
      contacts.map(({ id, name }, idx, _) => {
        return { label: name, value: id }
      })
    )
  )

  // ? how to handle selections?
  const onSelect = console.debug

  const react = combineLatest({ options: options$ }).pipe(
    map(({ options }) => h(View, { options, onSelect }))
  )

  return {
    react,
  }
}
