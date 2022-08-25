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

export interface Sources {
  react: ReactSource
  graph: GraphSource
  action: ActionSource
}

export const Timeline = (sources: Sources, tagPrefix?: string) => {
  const tagScope = `${tagPrefix}/Timeline`
  const tag = makeTagger(tagScope)

  // TODO: network
  // Contacts (signed yours U you signed theirs)
  // > converastions
  // ? signed your conversation ("X cosigned your converastion")
  // noted a converastion

  // ! Opps
  // mentioned your opp(s) (owned by you)
  // mentioned opportunity (any you've signed) ! no, if you don't own it

  // its' just converastions
  // - X noted conversation
  // - X signed conversation
  // - X mentioned your opps: - list, - list20

  // X, Y discussed [Opp], [Opp2] and [Opp3]

  // const events$ = getTimeline(viewer, filters: opp: id)
  // conversation
  // profileChange

  const react = of(h(View))

  return {
    react,
  }
}
