import { ReactSource } from "@cycle/react"
import {
  catchError,
  EMPTY,
  filter,
  map,
  merge,
  of,
  share,
  shareReplay,
  switchMap,
} from "rxjs"
import { match } from "ts-pattern"
import { filterResultErr, filterResultOk } from "ts-results/rxjs-operators"
import { ErrorCode, getConversation$, Source as GraphSource } from "~/graph"
import { makeTagger } from "~/log"
import { error } from "~/notice"
import { push, routes, Source as RouterSource } from "~/router"
import { shareLatest } from "~/rx"
import { Form } from "../Form"

const tagPrefix = "Conversations/Edit"
const tag = makeTagger(tagPrefix)

interface Sources {
  react: ReactSource
  router: RouterSource
  graph: GraphSource
}

export const Edit = (sources: Sources) => {
  const {
    router: { history$ },
  } = sources

  const id$ = history$.pipe(
    switchMap((route) =>
      match(route)
        .with({ name: routes.editConversation.name }, ({ params }) =>
          of(params.id)
        )
        .otherwise(() => EMPTY)
    ),
    tag("id$"),
    share()
  )
  const getRecord$ = id$.pipe(
    switchMap((id) => getConversation$(id)),
    tag("getRecord$"),
    share()
  )
  const record$ = getRecord$.pipe(filterResultOk(), tag("record$"), share())
  const userError$ = getRecord$.pipe(
    filterResultErr(),
    tag("userError$"),
    share()
  )
  const redirectNotFound$ = userError$.pipe(
    filter(({ code }) => code === ErrorCode.NotFound),
    map((_) => push(routes.conversations())),
    tag("redirectNotFound$"),
    share()
  )

  const { react, router: formRouter$ } = Form(
    {
      ...sources,
      props: { id$, record$ },
    },
    tagPrefix
  )
  const router = merge(redirectNotFound$, formRouter$)

  const notice = userError$.pipe(
    map(({ message }) => error({ description: message }))
  )

  return {
    react,
    notice,
    router,
  }
}
