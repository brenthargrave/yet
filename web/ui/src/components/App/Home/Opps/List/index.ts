import { h, ReactSource } from "@cycle/react"
import { combineLatest, map, of, share } from "rxjs"
import { Source as GraphSource } from "~/graph"
import { makeTagger } from "~/log"
import { Source as RouterSource } from "~/router"
import { View } from "./View"
import { cb$ } from "~/rx"

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

  return {
    react,
  }
}
