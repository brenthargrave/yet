import { h, ReactSource } from "@cycle/react"
import { captureException } from "@sentry/react"
import {
  distinctUntilChanged,
  combineLatest,
  debounceTime,
  EMPTY,
  merge,
  Observable,
  of,
} from "rxjs"
import { map, switchMap } from "rxjs/operators"
import { match } from "ts-pattern"
import { Source as ActionSource } from "~/action"
import { Auth } from "~/components/Auth"
import { Landing } from "~/components/Landing"
import {
  Customer,
  eatUnrecoverableError,
  isLurking,
  Source as GraphSource,
} from "~/graph"
import { t } from "~/i18n"
import { makeTagger } from "~/log"
import { push, routes, Source as RouterSource } from "~/router"
import { shareLatest } from "~/rx"
import { toast } from "~/toast"
import { Home } from "./Home"
import { View as AppView } from "./View"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type CycleComponent<T> = (
  sources: T,
  ...args: any[]
) => Record<string, Observable<any>>
export type CC<T> = CycleComponent<T>

// @ts-ignore
const { VITE_API_ENV } = import.meta.env

enum State {
  auth = "auth",
  landing = "landing",
  home = "home",
}

export interface Sources {
  react: ReactSource
  router: RouterSource
  graph: GraphSource
  action: ActionSource
}

export const App = (sources: Sources) => {
  const tagScope = `App`
  const tag = makeTagger(tagScope)

  const { history$: _history$ } = sources.router
  const history$ = _history$.pipe(tag("history$"), shareLatest())

  const { token$, me$: cachedMe$ } = sources.graph

  const { react: landingView$ } = Landing(sources)

  const home = Home(sources)
  const {
    value: { me$: authMe$ },
    ...auth
  } = Auth(sources)

  const me$: Observable<null | Customer> = merge(authMe$, cachedMe$).pipe(
    tag("me$")
  )

  const guardHistory$ = history$.pipe(
    switchMap((route) => {
      // NOTE: redirect unsupported paths to root
      return route.name ? EMPTY : of(push(routes.root()))
    }),
    tag("guardHistory$")
  )

  const state$ = combineLatest({
    route: history$,
    me: me$,
  }).pipe(
    debounceTime(100),
    map(({ route, me }) => {
      return match(route.name)
        .with(routes.in.name, () => State.auth)
        .with(routes.root.name, () =>
          isLurking(me) ? State.landing : State.home
        )
        .otherwise(() => State.home)
    }),
    distinctUntilChanged(),
    tag("state$")
  )

  const bodyView$ = state$.pipe(
    switchMap((state) =>
      match(state)
        .with(State.landing, () => landingView$)
        .with(State.auth, () => auth.react)
        .with(State.home, () => home.react)
        .exhaustive()
    ),
    tag("bodyView$")
  )

  const react = combineLatest({ body: bodyView$ }).pipe(
    map(({ body }) => h(AppView, { body })),
    eatUnrecoverableError((error, caught$) => {
      captureException(error)
      toast({
        title: t("default.error.title"),
        description: t("default.error.description"),
        status: "error",
      })
    }),
    tag("react$")
  )

  const router = merge(guardHistory$, auth.router, home.router).pipe(
    eatUnrecoverableError()
  )
  const notice = merge(auth.notice, home.notice).pipe(eatUnrecoverableError())
  const graph = merge(auth.graph, home.graph).pipe(eatUnrecoverableError())
  const track = merge(home.track).pipe(eatUnrecoverableError())
  const action = merge(home.action)

  return {
    react,
    router,
    notice,
    graph,
    track,
    action,
  }
}
