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
    graph: { me$, opps$ },
    props: { location },
  } = sources

  const [onClickNew, onClickNew$] = cb$(tag("onClickNew$"))
  const [onClickOpp, onClickOpp$] = cb$<Opp>(tag("onClickOpp$"))
  const [onClickAdd, onClickAdd$] = cb$<Opp>(tag("onClickAdd$"))

  const embedOpp$ = onClickAdd$.pipe(tag("appendOpp$"), share())

  const create$ = onClickNew$.pipe(
    mapTo(act(Actions.createOpp)),
    tag("create$")
  )

  const show$ = onClickOpp$.pipe(
    map((opp) => act(Actions.showOpp, { opp })),
    tag("show$")
  )

  const [onClickPay, onClickPay$] = cb$<Opp>(tag("onClickPay$"))
  const createPayment$ = onClickPay$.pipe(
    map((opp) => act(Actions.createPayment, { opp })),
    tag("pay$"),
    share()
  )

  const props$ = combineLatest({
    viewer: me$,
    opps: opps$,
  }).pipe(tag("props$"), share())

  const react = props$.pipe(
    map((props) =>
      h(View, {
        ...props,
        location,
        onClickNew,
        onClickAdd,
        onClickOpp,
        onClickPay,
      })
    ),
    tag("react")
  )

  const action = merge(create$, show$, createPayment$)
  const value = { embedOpp$ }

  return {
    action,
    react,
    value,
  }
}
