import { h, ReactSource } from "@cycle/react"
import { Observable, of } from "rxjs"
import { Source as ActionSource } from "~/action"
import { Source as GraphSource } from "~/graph"
import { makeTagger } from "~/log"
import { View } from "./View"

enum State {
  loading = "loading",
  ready = "ready",
}

export interface Props {
  state$: Observable<State>
}

export interface Sources {
  react: ReactSource
  graph: GraphSource
  action: ActionSource
  props: Props
}

export const Timeline = (sources: Sources, tagPrefix?: string) => {
  const tagScope = `${tagPrefix}/Timeline`
  const tag = makeTagger(tagScope)

  const react = of(h(View))

  return {
    react,
  }
}
