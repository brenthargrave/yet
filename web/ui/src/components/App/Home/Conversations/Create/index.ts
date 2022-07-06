import { ReactSource } from "@cycle/react"
import { merge, of, share } from "rxjs"
import { ulid } from "ulid"
import { ConversationStatus, Source as GraphSource } from "~/graph"
import { makeTagger } from "~/log"
import { Source as RouterSource } from "~/router"
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

  const record$ = of({
    id: ulid(),
    invitees: [],
    note: null,
    status: ConversationStatus.Draft,
  }).pipe(tag("record$"), share())

  const { react, router: formRouter$ } = Form(
    {
      ...sources,
      props: { record$ },
    },
    tagPrefix
  )
  const router = merge(formRouter$)

  return {
    react,
    router,
  }
}
