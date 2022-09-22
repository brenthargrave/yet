import { h, ReactSource } from "@cycle/react"
import { combineLatest, filter, map, Observable, switchMap } from "rxjs"
import { isNotNullish } from "rxjs-etc"
import { filterResultOk } from "ts-results/rxjs-operators"
import { Source as ActionSource } from "~/action"
import {
  getMentions$,
  Mentioner,
  Opp,
  Profile,
  Source as GraphSource,
} from "~/graph"
import { mentionersFrom } from "~/graph/models/mention"
import { makeTagger } from "~/log"
import { Source as RouterSource } from "~/router"
import { cb$, shareLatest } from "~/rx"
import { View } from "./View"

export interface Sources {
  react: ReactSource
  router: RouterSource
  graph: GraphSource
  action: ActionSource
  props: {
    opp$: Observable<Opp>
  }
}

export const Recipient = (sources: Sources, tagPrefix?: string) => {
  const tagScope = `${tagPrefix}/Recipient`
  const tag = makeTagger(tagScope)

  const {
    graph: { me$ },
    props: { opp$: _opp$ },
  } = sources
  const me = me$.pipe(filter(isNotNullish), tag("me"), shareLatest())
  const opp = _opp$.pipe(tag("opp$"), shareLatest())

  const [onClickProfile, onClickProfile$] = cb$<Profile>(tag("onClickProfile$"))

  const recipient$ = onClickProfile$.pipe(tag("recipientt$"), shareLatest())

  const mentions = opp.pipe(
    switchMap(({ id }) => getMentions$({ oppId: id })),
    filterResultOk(),
    tag("mentions$"),
    shareLatest()
  )

  const mentioners = combineLatest({
    me,
    mentions,
  }).pipe(
    // @ts-ignore
    map(({ mentions, me }): Mentioner[] => mentionersFrom(mentions, me)),
    tag("mentioners$"),
    shareLatest()
  )

  const props$ = combineLatest({ opp, mentioners }).pipe(tag("props$"))

  const react = props$.pipe(
    map((props) =>
      h(View, {
        ...props,
        onClickProfile,
      })
    )
  )

  return {
    react,
    value: { recipient$ },
  }
}
