import { ReactSource } from "@cycle/react"
import { EMPTY, of, switchMap } from "rxjs"
import { match } from "ts-pattern"
import { ulid } from "ulid"
import { Source as GraphSource } from "~/graph"
import { makeTagger } from "~/log"
import { routes, Source as RouterSource } from "~/router"
import { shareLatest } from "~/rx"
import { Main as Form } from "../Form"

interface Sources {
  react: ReactSource
  router: RouterSource
  graph: GraphSource
}

export const Main = (sources: Sources, tagPrefix?: string) => {
  const tagScope = `${tagPrefix}/Create`
  const tag = makeTagger(tagScope)

  const {
    graph: { opps$ },
    router: { history$ },
  } = sources

  const record$ = history$.pipe(
    switchMap((route) =>
      match(route.name)
        .with(routes.newConversationNewOpp.name, () =>
          of({
            id: ulid(),
            org: "",
            role: "",
            desc: "",
          })
        )
        .otherwise(() => EMPTY)
    ),
    tag("record$"),
    shareLatest()
  )

  const { react, router, notice } = Form(
    {
      ...sources,
      props: { record$ },
    },
    tagScope
  )

  return {
    react,
    router,
    notice,
  }
}
