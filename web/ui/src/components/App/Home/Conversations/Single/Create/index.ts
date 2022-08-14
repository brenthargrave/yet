import { ReactSource } from "@cycle/react"
import { filter, map, of, switchMap } from "rxjs"
import { pairwiseStartWith } from "rxjs-etc/dist/esm/operators"
import { Source as ActionSource } from "~/action"
import { newConversation, Source as GraphSource } from "~/graph"
import { makeTagger } from "~/log"
import { isNewConversationRoute, Source as RouterSource } from "~/router"
import { shareLatest } from "~/rx"
import { Form, Mode } from "../Form"

interface Sources {
  react: ReactSource
  router: RouterSource
  graph: GraphSource
  action: ActionSource
}

export const Main = (sources: Sources, tagPrefix?: string) => {
  const {
    router: { history$ },
  } = sources

  const tagScope = `${tagPrefix}/Create`
  const tag = makeTagger(tagScope)

  const record$ = history$.pipe(
    pairwiseStartWith(null),
    filter(
      ([prior, current]) =>
        isNewConversationRoute(current) && !isNewConversationRoute(prior)
    ),
    switchMap((_) => of(newConversation())),
    tag("record$"),
    shareLatest()
  )

  const id$ = record$.pipe(
    map((record) => record.id),
    tag("id$"),
    shareLatest()
  )

  const { react, router, notice, track, graph } = Form(
    {
      ...sources,
      props: { id$, record$ },
    },
    tagScope,
    Mode.create
  )

  return {
    react,
    router,
    notice,
    track,
    graph,
  }
}
