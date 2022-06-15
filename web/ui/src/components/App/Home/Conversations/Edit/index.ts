import { h, ReactSource } from "@cycle/react"
import { combineLatest, map, Observable, of } from "rxjs"
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

interface Contact {
  id: string
  name: string
}

export const Edit = (sources: Sources) => {
  // ? how to handle selections?
  const onSelect = console.debug

  const contacts$: Observable<Contact[]> = of([])
  const options$ = contacts$.pipe(
    map((contacts) =>
      contacts.map(({ id, name }, idx, _) => {
        return { label: name, value: id }
      })
    )
  )

  const react = combineLatest({ options: options$ }).pipe(
    map(({ options }) => h(View, { options, onSelect }))
  )

  return {
    react,
  }
}
