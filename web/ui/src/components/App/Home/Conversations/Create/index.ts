import { ReactSource } from "@cycle/react"
import { EMPTY, map, of, switchMap } from "rxjs"
import { match, P } from "ts-pattern"
import { ulid } from "ulid"
import { ConversationStatus, Source as GraphSource } from "~/graph"
import { makeTagger } from "~/log"
import { routes, Source as RouterSource } from "~/router"
import { shareLatest } from "~/rx"
import { Form } from "../Form"

interface Sources {
  react: ReactSource
  router: RouterSource
  graph: GraphSource
}

export const Main = (sources: Sources, tagPrefix?: string) => {
  const {
    router: { history$ },
  } = sources

  const tagScope = `${tagPrefix}/Create`
  const tag = makeTagger(tagScope)

  const record$ = history$.pipe(
    switchMap((route) =>
      match(route.name)
        .with(
          P.union(
            routes.newConversation.name,
            routes.newConversationOpps.name,
            routes.newConversationNewOpp.name,
            routes.newConversationOpp.name
          ),
          () =>
            of({
              id: ulid(),
              invitees: [],
              note: null,
              status: ConversationStatus.Draft,
              occurredAt: new Date(),
            })
        )
        .otherwise(() => EMPTY)
    ),
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
    tagScope
  )

  return {
    react,
    router,
    notice,
    track,
    graph,
  }
}
