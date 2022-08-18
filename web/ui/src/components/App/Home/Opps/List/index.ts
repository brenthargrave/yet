import { h, ReactSource } from "@cycle/react"
import { combineLatest, map, merge, share } from "rxjs"
import { act, Actions } from "~/action"
import { Opp, Source as GraphSource } from "~/graph"
import { makeTagger } from "~/log"
import { cb$, mapTo } from "~/rx"
import { View } from "./View"
import { Location } from ".."

interface Props {
  location: Location
}

interface Sources {
  react: ReactSource
  graph: GraphSource
  props: Props
}

export const Main = (sources: Sources, tagPrefix?: string) => {
  const tagScope = `${tagPrefix}/List`
  const tag = makeTagger(tagScope)

  const {
    graph: { opps$ },
    props: { location },
  } = sources

  const [onClickCreate, onClickCreate$] = cb$(tag("onClickNew$"))
  const [onClickOpp, onClickOpp$] = cb$<Opp>(tag("onClickOpp$"))
  const [onClickAdd, onClickAdd$] = cb$<Opp>(tag("onClickAdd$"))

  const embedOpp$ = onClickAdd$.pipe(tag("appendOpp$"), share())

  const create$ = onClickCreate$.pipe(
    mapTo(act(Actions.createOpp)),
    tag("create$")
  )

  const show$ = onClickOpp$.pipe(
    map((opp) => act(Actions.showOpp, { opp })),
    tag("show$")
  )

  const props$ = combineLatest({
    opps: opps$,
  }).pipe(tag("props$"), share())

  const react = props$.pipe(
    map((props) =>
      h(View, {
        ...props,
        location,
        onClickCreate,
        onClickAdd,
        onClickOpp,
      })
    ),
    tag("react")
  )

  const action = merge(create$, show$)
  const value = { embedOpp$ }

  return {
    action,
    react,
    value,
  }
}
