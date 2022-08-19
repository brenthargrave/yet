import { ReactSource } from "@cycle/react"
import { distinctUntilChanged, filter, map, of, switchMap } from "rxjs"
import { pairwiseStartWith } from "rxjs-etc/dist/esm/operators"
import { Source as ActionSource } from "~/action"
import {
  newConversation,
  Source as GraphSource,
  subscribeConversation$,
} from "~/graph"
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

  const liveRecord$ = id$.pipe(
    distinctUntilChanged(),
    switchMap((id) => subscribeConversation$({ id })),
    tag("liveRecord$"),
    shareLatest()
  )

  const form = Form(
    {
      ...sources,
      props: { id$, record$, liveRecord$ },
    },
    tagScope,
    Mode.create
  )

  return {
    ...form,
  }
}
