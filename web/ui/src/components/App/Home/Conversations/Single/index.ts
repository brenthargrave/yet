import { h, ReactSource } from "@cycle/react"
import { map, merge, startWith, switchMap } from "rxjs"
import { match } from "ts-pattern"
import { ErrorView } from "~/components/App/ErrorView"
import { Source as GraphSource } from "~/graph"
import { makeTagger } from "~/log"
import { routes, Source as RouterSource } from "~/router"
import { Main as Show } from "../Show"
import { Main as Sign } from "../Sign"
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

  // TODO: extract record fetching.

  const show = Show(sources, tagScope)
  const sign = Sign(sources, tagScope)

  const props$ = history$.pipe(
    switchMap((route) =>
      match(route.name)
        .with(routes.signConversation.name, () => sign.value.props$)
        .with(routes.conversation.name, () => show.value.props$)
        .run()
    )
  )
  const userError$ = history$.pipe(
    switchMap((route) =>
      match(route.name)
        .with(routes.signConversation.name, () => sign.value.userError$)
        .with(routes.conversation.name, () => show.value.userError$)
        .run()
    )
  )

  const react = merge(
    props$.pipe(map((props) => h(View, { ...props }))),
    userError$.pipe(map((error) => h(ErrorView, { error })))
  ).pipe(startWith(null), tag("react"))

  // const react = history$.pipe(
  //   switchMap((route) =>
  //     match(route.name)
  //       .with(routes.conversation.name, () => show.react)
  //       .with(routes.signConversation.name, () => sign.react)
  //       .run()
  //   )
  // )

  const router = merge(sign.router, show.router)
  const notice = merge(sign.notice, show.notice)

  return {
    react,
    router,
    notice,
  }
}
