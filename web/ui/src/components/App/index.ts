import { h, ReactSource } from "@cycle/react"
import { captureException } from "@sentry/react"
import { catchError, combineLatest, EMPTY, merge, Observable } from "rxjs"
import { map, switchMap } from "rxjs/operators"
import { match } from "ts-pattern"
import { not } from "ramda"
import { Auth } from "~/components/Auth"
import { Landing } from "~/components/Landing"
import { Onboarding } from "~/components/Onboarding"
import {
  Customer,
  GraphWatchError,
  isAuthenticated,
  isLurking,
  isOnboard,
  isOnboarding,
  Source as GraphSource,
} from "~/graph"
import { t } from "~/i18n"
import { makeTagger } from "~/log"
import { Source as RouterSource } from "~/router"
import { toast } from "~/toast"
import { Header } from "./Header"
import { Home } from "./Home"
import { View as AppView } from "./View"

export type CycleComponent<T> = (sources: T) => Record<string, Observable<any>>
export type CC<T> = CycleComponent<T>

const tag = makeTagger("App")

export interface Sources {
  react: ReactSource
  router: RouterSource
  graph: GraphSource
}

export const App = (sources: Sources) => {
  const { history$: _history$ } = sources.router
  const history$ = _history$.pipe(tag("history$"))
  const { token$, me$: cachedMe$ } = sources.graph

  const { react: headerView$ } = Header(sources)
  const { react: landingView$ } = Landing(sources)
  const { react: homeView$ } = Home(sources)
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
        .with("root", () => {
          if (isLurking(me)) return landingView$
          if (isOnboarding(me)) return onboardingView$
          return homeView$
        })
        .with("in", () => authView$)
        .otherwise(() => landingView$)
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
      return error instanceof GraphWatchError
        ? EMPTY
        : caught$.pipe(tag("caught$"))
    }),
    tag("App.react$")
  )

  // NOTE: ignore errors & resubscribe in all drivers
  const router = merge(authRouter).pipe(catchError((error, caught$) => caught$))
  const notice = merge(authNotice).pipe(catchError((error, caught$) => caught$))
  const graph = merge(authGraph$).pipe(catchError((error, caught$) => caught$))

  return {
    react,
    router,
    notice,
    graph,
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
