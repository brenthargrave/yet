import { h, ReactSource } from "@cycle/react"
import { captureException } from "@sentry/react"
import { catchError, combineLatest, EMPTY, merge, Observable, of } from "rxjs"
import { map, switchMap } from "rxjs/operators"
import { match } from "ts-pattern"
import { Auth } from "~/components/Auth"
import { Landing } from "~/components/Landing"
import { Onboarding } from "~/components/Onboarding"
import {
  Customer,
  GraphWatchError,
  isLurking,
  isOnboarding,
  Source as GraphSource,
} from "~/graph"
import { t } from "~/i18n"
import { makeTagger } from "~/log"
import { push, routes, Source as RouterSource } from "~/router"
import { shareLatest } from "~/rx"
import { toast } from "~/toast"
import { Header } from "./Header"
import { Home } from "./Home"
import { View as AppView } from "./View"

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
    catchError((error, caught$) => {
      captureException(error)
      toast({
        title: t("default.error.title"),
        description: t("default.error.description"),
        status: "error",
      })
      // NOTE: graph watch errors are fatal, will loop indefinitely if resubscribed
      if (error instanceof GraphWatchError) return EMPTY
      // TODO: replace w/ exp. backoff?
      if (VITE_API_ENV === "dev") return EMPTY
      return caught$.pipe(tag("caught$"))
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
  // NOTE: ignore errors & resubscribe in all drivers
  const router = merge(guardedHistory$, authRouter, homeRouter$).pipe(
    catchError((error, caught$) => caught$)
  )
  const notice = merge(authNotice, homeNotice$).pipe(
    catchError((error, caught$) => caught$)
  )
  const graph = merge(authGraph$).pipe(catchError((error, caught$) => caught$))
  const track = merge(home.track).pipe(catchError((error, caught$) => caught$))

  return {
    react,
    router,
    notice,
    graph,
    track,
  }
}

// import * as React from "react"
// import * as ReactDOM from "react-dom"
// export const App = () => {
//   const route = useRoute()
//   return h(View, [
//     match(route.name)
//       .with("home", () => h(Landing))
//       .with("in", () => h(PhoneSubmit))
//       .otherwise(() => h(Landing)),
//     // TODO: .exhaustive()
//   ])
// }
