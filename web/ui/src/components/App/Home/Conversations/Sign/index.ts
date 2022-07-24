import { h, ReactSource } from "@cycle/react"
import {
  combineLatest,
  debounceTime,
  EMPTY,
  map,
  merge,
  of,
  share,
  startWith,
  switchMap,
  withLatestFrom,
} from "rxjs"
import { match } from "ts-pattern"
import { filterResultErr, filterResultOk } from "ts-results/rxjs-operators"
import { ErrorView } from "~/components/App/ErrorView"
import {
  getConversation$,
  isAuthenticated,
  signConversation$,
  Source as GraphSource,
} from "~/graph"
import { makeTagger } from "~/log"
import { error } from "~/notice"
import { push, routes, Source as RouterSource } from "~/router"
import { cb$, shareLatest } from "~/rx"
import { View } from "./View"

interface Sources {
  react: ReactSource
  router: RouterSource
  graph: GraphSource
}

export const Sign = (sources: Sources, tagPrefix?: string) => {
  const {
    router: { history$ },
    graph: { me$ },
  } = sources

  const tagScope = `${tagPrefix}/Sign`
  const tag = makeTagger(tagScope)

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

  const [onClickAuth, onClickAuth$] = cb$(tag("onClickAuth$"))
  const redirectToAuth$ = onClickAuth$.pipe(
    map((_) => push(routes.in())),
    tag("redirectToAuth$"),
    share()
  )

  const requiresAuth$ = me$.pipe(
    map((me) => !isAuthenticated(me)),
    startWith(false),
    debounceTime(100),
    tag("requiresAuth$"),
    shareLatest()
  )

  const [onClickSign, onClickSign$] = cb$(tag("onClickSign$"))
  const signResult$ = onClickSign$.pipe(
    withLatestFrom(id$),
    switchMap(([_, id]) => signConversation$({ id })),
    tag("sigResult$")
  )

  const isSigningDisabled$ = merge(
    onClickSign$.pipe(map((_) => true)),
    signResult$.pipe(map((_) => false))
  ).pipe(startWith(false), tag("isSigningDisabled$"), shareLatest())

  const props$ = combineLatest({
    conversation: record$,
    requiresAuth: requiresAuth$,
    isSigningDisabled: isSigningDisabled$,
  }).pipe(tag("props$"))

  const react = merge(
    props$.pipe(
      map((props) => h(View, { ...props, onClickAuth, onClickSign }))
    ),
    userError$.pipe(map((error) => h(ErrorView, { error })))
  ).pipe(startWith(null), tag("react"))

  const notice = merge(userErrorNotice$)
  const router = merge(redirectToAuth$)

  return {
    react,
    router,
    notice,
  }
}
