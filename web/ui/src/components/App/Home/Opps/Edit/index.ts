import { ReactSource } from "@cycle/react"
import { EMPTY, map, of, share, switchMap } from "rxjs"
import { match } from "ts-pattern"
import { filterResultErr, filterResultOk } from "ts-results/rxjs-operators"
import { getOpp$, Source as GraphSource } from "~/graph"
import { makeTagger } from "~/log"
import { error } from "~/notice"
import { routes, Source as RouterSource } from "~/router"
import { shareLatest } from "~/rx"
import { Main as Form } from "../Form"

interface Sources {
  react: ReactSource
  router: RouterSource
  graph: GraphSource
}

export const Main = (sources: Sources, tagPrefix?: string) => {
  const tagScope = `${tagPrefix}/Edit`
  const tag = makeTagger(tagScope)

  const {
    graph: { opps$ },
    router: { history$ },
  } = sources

  const id$ = history$.pipe(
    switchMap((route) =>
      match(route)
        .with({ name: routes.newConversationOpp.name }, ({ params }) =>
          of(params.id)
        )
        .otherwise(() => EMPTY)
    ),
    tag("id$"),
    shareLatest()
  )

  const result$ = id$.pipe(
    switchMap((id) => getOpp$(id)),
    tag("result$"),
    shareLatest()
  )

  const record$ = result$.pipe(filterResultOk(), tag("record$"), shareLatest())

  const userError$ = result$.pipe(
    filterResultErr(),
    tag("userError$"),
    shareLatest()
  )

  const userErrorNotice$ = userError$.pipe(
    map(({ message }) => error({ description: message })),
    tag("userErrorNotice$"),
    share()
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
