import { h, ReactSource } from "@cycle/react"
import { EMPTY, map, merge, of, share, startWith, switchMap } from "rxjs"
import { match } from "ts-pattern"
import { filterResultErr, filterResultOk } from "ts-results/rxjs-operators"
import { ErrorView } from "~/components/App/ErrorView"
import { getConversation$, Source as GraphSource } from "~/graph"
import { makeTagger } from "~/log"
import { error } from "~/notice"
import { routes, Source as RouterSource } from "~/router"
import { shareLatest } from "~/rx"
import { Main as Show } from "./Show"
import { Main as Sign } from "./Sign"
import { View } from "./View"

interface Sources {
  react: ReactSource
  router: RouterSource
  graph: GraphSource
}

export const Main = (sources: Sources, tagPrefix?: string) => {
  const tagScope = `${tagPrefix}/Single`
  const tag = makeTagger(tagScope)

  const {
    router: { history$ },
  } = sources

  const id$ = history$.pipe(
    switchMap((route) =>
      match(route)
        .with({ name: routes.conversation.name }, ({ params }) => of(params.id))
        .with({ name: routes.signConversation.name }, ({ params }) =>
          of(params.id)
        )
        .otherwise(() => EMPTY)
    ),
    tag("id$"),
    shareLatest()
  )

  const result$ = id$.pipe(
    switchMap((id) => getConversation$(id)),
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

  const singleSources = { ...sources, props: { record$ } }
  const show = Show(singleSources, tagScope)
  const sign = Sign(singleSources, tagScope)

  const props$ = history$.pipe(
    switchMap((route) =>
      match(route.name)
        .with(routes.signConversation.name, () => sign.value.props$)
        .with(routes.conversation.name, () => show.value.props$)
        .run()
    )
  )

  const react = merge(
    props$.pipe(map((props) => h(View, { ...props }))),
    userError$.pipe(map((error) => h(ErrorView, { error })))
  ).pipe(startWith(null), tag("react"))

  const router = merge(sign.router, show.router)
  const notice = merge(userErrorNotice$)
  const track = merge(sign.track)

  return {
    react,
    router,
    notice,
    track,
  }
}
