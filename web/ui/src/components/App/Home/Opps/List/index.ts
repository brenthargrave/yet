import { h, ReactSource } from "@cycle/react"
import { combineLatest, map, share, merge } from "rxjs"
import { Source as GraphSource } from "~/graph"
import { makeTagger } from "~/log"
import { push, routes, Source as RouterSource } from "~/router"
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

  const [onClickCreate, onClickCreate$] = cb$(tag("onClickNew$"))
  const showCreate$ = onClickCreate$.pipe(
    mapTo(push(routes.newConversationNewOpp())),
    tag("showCreate$")
  )
  // const showCreate$ = onClickCreate$.pipe(
  //   mapTo(State.create),
  //   tag("showCreate$")
  // )

  const props$ = combineLatest({
    opps: opps$,
  }).pipe(tag("props$"), share())

  const react = props$.pipe(
    map((props) =>
      h(View, {
        ...props,
        onClickCreate,
      })
    ),
    tag("react")
  )

  // const router = merge()
  const router = merge(showCreate$)

  // const action = merge(showCreate$)
  const action = merge()
  const value = { action }

  return {
    react,
    router,
    value,
  }
}
