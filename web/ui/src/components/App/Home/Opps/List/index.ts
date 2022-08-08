import { h, ReactSource } from "@cycle/react"
import { map, of } from "rxjs"
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

  const [onClickNew, onClickNew$] = cb$(tag("onClickNew$"))

  const react = of(
    h(View, {
      onClickNew,
    })
  ).pipe(tag("react"))

  return {
    react,
  }
}
