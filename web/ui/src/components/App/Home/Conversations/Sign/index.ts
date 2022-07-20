import { h, ReactSource } from "@cycle/react"
import {
  EMPTY,
  filter,
  map,
  merge,
  of,
  share,
  startWith,
  switchMap,
} from "rxjs"
import { match } from "ts-pattern"
import { filterResultErr, filterResultOk } from "ts-results/rxjs-operators"
import { ErrorCode, getConversation$, Source as GraphSource } from "~/graph"
import { makeTagger } from "~/log"
import { error } from "~/notice"
import { push, routes, Source as RouterSource } from "~/router"
import { shareLatest } from "~/rx"
import { View } from "./View"
import { ErrorView } from "~/components/App/ErrorView"

interface Sources {
  react: ReactSource
  router: RouterSource
  graph: GraphSource
}

export const Sign = (sources: Sources, tagPrefix?: string) => {
  const {
    router: { history$ },
  } = sources

  const tagScope = `${tagPrefix}/Sign`
  const tag = makeTagger(tagScope)

  // ! TODO: dedupe w/ Edit? id, getRecord, not-found/redirect
  const id$ = history$.pipe(
    switchMap((route) =>
      match(route)
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
  const record$ = result$.pipe(filterResultOk(), tag("record$"), share())
  const userError$ = result$.pipe(filterResultErr(), tag("userError$"), share())
  const userErrorNotice$ = userError$.pipe(
    map(({ message }) => error({ description: message }))
  )
  const redirectNotFound$ = userError$.pipe(
    filter(({ code }) => code === ErrorCode.NotFound),
    map((_) => push(routes.conversations())),
    tag("redirectNotFound$"),
    share()
  )

  // ! unique logic begins here
  const react = merge(
    record$.pipe(map((conversation) => h(View, { conversation }))),
    userError$.pipe(map((error) => h(ErrorView, { error })))
  ).pipe(startWith(null), tag("react"))

  const router = merge(redirectNotFound$)
  const notice = merge(userErrorNotice$)

  return {
    react,
    router,
    notice,
  }
}
