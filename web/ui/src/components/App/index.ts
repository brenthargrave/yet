/* eslint-disable @typescript-eslint/no-explicit-any */
import { h, ReactSource } from "@cycle/react"
import { captureException, withScope } from "@sentry/react"
import {
  combineLatest,
  debounceTime,
  distinctUntilChanged,
  EMPTY,
  merge,
  Observable,
  of,
} from "rxjs"
import { map, switchMap } from "rxjs/operators"
import { match } from "ts-pattern"
import { pluck } from "ramda"
import { Source as ActionSource } from "~/action"
import { Auth } from "~/components/Auth"
import { Landing } from "~/components/Landing"
import { Unsubscribe } from "./Unsubscribe"
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
import { Oauth } from "./Oauth"

export type CycleComponent<T> = (
  sources: T,
  ...args: any[]
) => Record<string, Observable<any>>
export type CC<T> = CycleComponent<T>

enum State {
  auth = "auth",
  landing = "landing",
  home = "home",
  unsubscribe = "unsubscribe",
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

  const landing = Landing(sources, tagScope)
  const oauth = Oauth(sources, tagScope)
  const home = Home(sources, tagScope)
  const {
    value: { me$: authMe$ },
    ...auth
  } = Auth(sources, tagScope)
  const unsubscribe = Unsubscribe(sources, "App")

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
        .with(routes.unsubscribeDigest.name, () => State.unsubscribe)
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
        .with(State.landing, () => landing.react)
        .with(State.auth, () => auth.react)
        .with(State.home, () => home.react)
        .with(State.unsubscribe, () => unsubscribe.react)
        .exhaustive()
    ),
    tag("bodyView$")
  )

  const react = combineLatest({ body: bodyView$ }).pipe(
    map(({ body }) => h(AppView, { body })),
    eatUnrecoverableError((error, caught$) => {
      withScope((scope) => {
        const { cause } = error
        if (cause) {
          const json = JSON.stringify(cause, null, 2)
          scope.setExtra("cause-as-json", json)
        }
        captureException(error)
      })
      toast({
        title: t("default.error.title"),
        description: t("default.error.description"),
        status: "error",
      })
    }),
    tag("react$")
  )

  const router = merge(
    guardHistory$,
    landing.router,
    auth.router,
    home.router,
    unsubscribe.router,
    oauth.router
  ).pipe(eatUnrecoverableError())
  const notice = merge(...pluck("notice", [auth, home])).pipe(
    eatUnrecoverableError()
  )
  const graph = merge(auth.graph, home.graph).pipe(eatUnrecoverableError())
  const track = merge(
    ...pluck("track", [landing, auth, home, unsubscribe])
  ).pipe(eatUnrecoverableError())
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
