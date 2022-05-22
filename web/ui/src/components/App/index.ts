import { h, ReactSource } from "@cycle/react"
import { catchError, combineLatest, merge, Observable } from "rxjs"
import { map, switchMap } from "rxjs/operators"
import { match } from "ts-pattern"
import { captureException } from "@sentry/react"

import { Source as RouterSource } from "~/router"
import { View as AppView } from "./View"
import { Landing } from "~/components/Landing"
import { Auth } from "~/components/Auth"
import { Onboarding } from "~/components/Onboarding"
import { toast } from "~/toast"
import { t } from "~/i18n"
import { makeTagger } from "~/log"
import { Customer, Source as GraphSource } from "~/graph"
import { isPresent } from "~/fp"

const tag = makeTagger("App")

interface Sources {
  react: ReactSource
  router: RouterSource
  graph: GraphSource
}

export const App = (sources: Sources) => {
  const { history$: _history$ } = sources.router
  const history$ = _history$.pipe(tag("history$"))
  const { token$, me$: cachedMe$ } = sources.graph

  const { react: landingView$ } = Landing(sources)
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

  const react = combineLatest({ route: history$, me: me$ }).pipe(
    switchMap(({ route, me }) => {
      return match(route.name)
        .with("root", () => (isPresent(me) ? onboardingView$ : landingView$))
        .with("in", () => authView$)
        .otherwise(() => landingView$)
    }),
    map((bodyView) => h(AppView, [bodyView])),
    catchError((error, caught$) => {
      captureException(error)
      toast({
        title: t("default.error.title"),
        description: t("default.error.description"),
        status: "error",
      })
      return caught$.pipe(tag("caught$"))
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
