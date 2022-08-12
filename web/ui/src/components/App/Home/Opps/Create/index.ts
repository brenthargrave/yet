import { ReactSource } from "@cycle/react"
import { EMPTY, of, switchMap } from "rxjs"
import { match } from "ts-pattern"
import { ulid } from "ulid"
import { Currency, Source as GraphSource } from "~/graph"
import { makeTagger } from "~/log"
import { routes, Source as RouterSource } from "~/router"
import { shareLatest } from "~/rx"
import { Main as Form, Target } from "../Form"

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
            desc: null,
            fee: {
              amount: 0,
              currency: Currency.Usd,
            },
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
      props: { record$, target: Target.create },
    },
    tagScope
  )

  return {
    react,
    router,
    notice,
  }
}
