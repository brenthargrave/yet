import { h, ReactSource } from "@cycle/react"
import { combineLatest, map, share, merge } from "rxjs"
import { Source as GraphSource } from "~/graph"
import { makeTagger } from "~/log"
import { Source as RouterSource } from "~/router"
import { cb$, mapTo } from "~/rx"
import { View } from "./View"
import { State } from ".."

interface Sources {
  react: ReactSource
  router: RouterSource
  graph: GraphSource
}

export const Main = (sources: Sources, tagPrefix?: string) => {
  const tagScope = `${tagPrefix}/List`
  const tag = makeTagger(tagScope)

  const {
    graph: { opps$ },
  } = sources

  const [onClickNew, onClickNew$] = cb$(tag("onClickNew$"))
  const create$ = onClickNew$.pipe(mapTo(State.create), tag("showCreate$"))

  const intent$ = merge(create$)

  const props$ = combineLatest({
    opps: opps$,
  }).pipe(tag("props$"), share())

  const react = props$.pipe(
    map((props) =>
      h(View, {
        ...props,
        onClickNew,
      })
    ),
    tag("react")
  )

  const value = { intent$ }
  return {
    react,
    value,
  }
}
