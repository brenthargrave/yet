import { h, ReactSource } from "@cycle/react"
import { captureException } from "@sentry/react"
import {
  debounceTime,
  catchError,
  combineLatest,
  EMPTY,
  merge,
  Observable,
  of,
} from "rxjs"
import { map, switchMap } from "rxjs/operators"
import { match } from "ts-pattern"
import { Auth } from "~/components/Auth"
import { Landing } from "~/components/Landing"
import { Onboarding } from "~/components/Onboarding"
import {
  Customer,
  GraphDefaultQueryError,
  isLurking,
  isOnboarding,
  Source as GraphSource,
  eatUnrecoverableError,
} from "~/graph"
import { t } from "~/i18n"
import { makeTagger } from "~/log"
import { push, routes, Source as RouterSource } from "~/router"
import { shareLatest } from "~/rx"
import { toast } from "~/toast"
import { Header } from "./Header"
import { Home } from "./Home"
import { View as AppView } from "./View"

export type CycleComponent<T> = (sources: T) => Record<string, Observable<any>>
export type CC<T> = CycleComponent<T>

const tag = makeTagger("App")

// @ts-ignore
const { VITE_API_ENV } = import.meta.env

export interface Sources {
  react: ReactSource
  router: RouterSource
  graph: GraphSource
}

export const App = (sources: Sources) => {
  const { history$: _history$ } = sources.router
  const history$ = _history$.pipe(tag("history$"), shareLatest())

  const { token$, me$: cachedMe$ } = sources.graph

  const { react: headerView$ } = Header(sources)

  const { react: landingView$ } = Landing(sources)

  const {
    react: homeView$,
    router: homeRouter$,
    notice: homeNotice$,
    ...home
  } = Home(sources)

  const {
    graph: authGraph$,
    react: authView$,
    router: authRouter,
    notice: authNotice,
    value: { me$: authMe$ },
  } = Auth(sources)

  const { react: onboardingView$ } = Onboarding(sources)

  const me$: Observable<null | Customer> = merge(authMe$, cachedMe$).pipe(
    tag("me$")
  )

  const bodyView$ = combineLatest({ route: history$, me: me$ }).pipe(
    debounceTime(100),
    switchMap(({ route, me }) => {
      return match(route.name)
        .with("in", () => authView$)
        .with("root", () => {
          if (isLurking(me)) return landingView$
          if (isOnboarding(me)) return onboardingView$
          return homeView$
        })
        .otherwise(() => homeView$)
    }),
    tag("bodyView$")
  )

  const react = combineLatest({ header: headerView$, body: bodyView$ }).pipe(
    map(({ header, body }) => h(AppView, { header, body })),
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

  const guardedHistory$ = history$.pipe(
    switchMap((route) => {
      // redirect unsupported paths to root
      return route.name ? EMPTY : of(push(routes.root()))
    }),
    tag("guardedHistory$")
  )
  const router = merge(guardedHistory$, authRouter, homeRouter$).pipe(
    eatUnrecoverableError()
  )
  const notice = merge(authNotice, homeNotice$).pipe(eatUnrecoverableError())
  const graph = merge(authGraph$).pipe(eatUnrecoverableError())
  const track = merge(home.track).pipe(eatUnrecoverableError())

  return {
    react,
    router,
    notice,
    graph,
    track,
  }
}
