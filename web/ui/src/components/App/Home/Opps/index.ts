import { ReactSource } from "@cycle/react"
import { Source as GraphSource } from "~/graph"
import { Source as RouterSource } from "~/router"
import { Main as List } from "./List"

interface Sources {
  react: ReactSource
  router: RouterSource
  graph: GraphSource
}

export const Main = (sources: Sources, tagPrefix?: string) => {
  const tagScope = `${tagPrefix}/Opps`

  const list = List(sources, tagScope)

  return {
    react: list.react,
  }
}
