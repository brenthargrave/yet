import { ReactSource } from "@cycle/react"
import { EMPTY, map, merge, of, share, shareReplay, switchMap } from "rxjs"
import { match } from "ts-pattern"
import { ulid } from "ulid"
import { ConversationStatus, Source as GraphSource } from "~/graph"
import { makeTagger } from "~/log"
import { routes, Source as RouterSource } from "~/router"
import { Form } from "../Form"

const tagPrefix = "Conversations/Create"
const tag = makeTagger(tagPrefix)

interface Sources {
  react: ReactSource
  router: RouterSource
  graph: GraphSource
}

export const Main = (sources: Sources) => {
  const {
    router: { history$ },
  } = sources

  const record$ = history$.pipe(
    switchMap((route) =>
      match(route)
        .with({ name: routes.newConversation.name }, ({ params }) =>
          of({
            id: ulid(),
            invitees: [],
            note: null,
            status: ConversationStatus.Draft,
          })
        )
        .otherwise(() => EMPTY)
    ),
    tag("record$"),
    shareReplay()
  )
  const id$ = record$.pipe(
    map((record) => record.id),
    tag("id$"),
    shareReplay()
  )

  const { react, router: formRouter$ } = Form(
    {
      ...sources,
      props: { id$, record$ },
    },
    tagPrefix
  )
  const router = merge(formRouter$)

  return {
    react,
    router,
  }
}