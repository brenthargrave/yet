import { h, ReactSource } from "@cycle/react"
import { combineLatest, map, share, merge } from "rxjs"
import { Source as GraphSource, Opp } from "~/graph"
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
  const [onClickOpp, onClickOpp$] = cb$<Opp>(tag("onClickOpp$"))
  // TODO: embed link in note
  const [onClickAdd, onClickAdd$] = cb$<Opp>(tag("onClickAdd$"))

  const showCreate$ = onClickCreate$.pipe(
    mapTo(push(routes.newConversationNewOpp())),
    tag("showCreate$")
  )

  const showSingle$ = onClickOpp$.pipe(
    map(({ id }) => push(routes.newConversationOpp({ id }))),
    tag("showSingle$")
  )

  const props$ = combineLatest({
    opps: opps$,
  }).pipe(tag("props$"), share())

  const react = props$.pipe(
    map((props) =>
      h(View, {
        ...props,
        onClickCreate,
        onClickAdd,
        onClickOpp,
      })
    ),
    tag("react")
  )

  const router = merge(showCreate$, showSingle$)
  const action = merge()
  const value = { action }

  return {
    react,
    router,
    value,
  }
}
