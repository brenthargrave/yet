import { h, ReactSource } from "@cycle/react"
import {
  Observable,
  of,
  combineLatest,
  map,
  switchMap,
  mapTo,
  merge,
} from "rxjs"
import { Source as ActionSource } from "~/action"
import { Source as GraphSource } from "~/graph"
import { makeTagger } from "~/log"
import { NEWID, push, routes } from "~/router"
import { shareLatest, cb$ } from "~/rx"
import { View, Props as ViewProps } from "./View"

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

  const {
    graph: { conversations$ },
  } = sources

  const [onClickNew, clickNew$] = cb$(tag("clickNew$"))
  const newConvo$ = clickNew$.pipe(
    map(() => push(routes.conversation({ id: NEWID })))
  )

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

  // TODO: subscribe to "conversationPublished-{id}"
  // TODO: alternately - should be able to figure out all
  // # potential subscribers -> creator, creator's contacts, signer's contacts

  const props$ = combineLatest({ conversations: conversations$ }).pipe(
    tag("props$"),
    shareLatest()
  )

  const react = props$.pipe(map((props) => h(View, { ...props, onClickNew })))

  const router = merge(newConvo$)

  return {
    react,
    router,
  }
}
