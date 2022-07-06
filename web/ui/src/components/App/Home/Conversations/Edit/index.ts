import { ReactSource } from "@cycle/react"
import { EMPTY, filter, map, merge, Observable, share, switchMap } from "rxjs"
import { match } from "ts-pattern"
import { Result } from "ts-results"
import { filterResultErr, filterResultOk } from "ts-results/rxjs-operators"
import {
  Conversation,
  ErrorCode,
  getConversation$,
  Source as GraphSource,
  UserError,
} from "~/graph"
import { makeTagger } from "~/log"
import { error } from "~/notice"
import { push, routes, Source as RouterSource } from "~/router"
import { Form } from "../Form"

const tag = makeTagger("Conversation/Edit")

interface Sources {
  react: ReactSource
  router: RouterSource
  graph: GraphSource
}

export const Edit = (sources: Sources) => {
  const {
    router: { history$ },
  } = sources

  const getRecord$: Observable<Result<Conversation, UserError>> = history$.pipe(
    switchMap((route) =>
      match(route)
        .with({ name: routes.editConversation.name }, ({ params }) =>
          getConversation$(params.id)
        )
        .otherwise(() => EMPTY)
    ),
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

  const { react, router: formRouter$ } = Form({
    ...sources,
    props: { record$ },
  })
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
