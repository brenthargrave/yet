import { h, ReactSource } from "@cycle/react"
import { catchError, merge, Observable } from "rxjs"
import { map, switchMap } from "rxjs/operators"
import { match } from "ts-pattern"
import { captureException } from "@sentry/react"

import { Source as RouterSource } from "~/router"
import { View as AppView } from "./View"
import { Landing } from "~/components/Landing"
import { Auth } from "~/components/Auth"
import { toast } from "~/toast"
import { t } from "~/i18n"
import { makeTagger } from "~/log"
import { error } from "~/notice"
import { Customer, Source as GraphSource } from "~/graph"

const tag = makeTagger("App")

interface Sources {
  react: ReactSource
  router: RouterSource
  graph: GraphSource
}

export const App = (sources: Sources) => {
  const { history$ } = sources.router
  const { token$, me$: cachedMe$ } = sources.graph

  const { react: landingView$ } = Landing(sources)
  const {
    react: authView$,
    router: authRouter,
    notice: authNotice,
    value: { me$: authMe$ },
    graph,
  } = Auth(sources)

  const me$: Observable<null | Customer> = merge(authMe$, cachedMe$).pipe(
    tag("me$")
  )

  // TODO: need app state that is fun(history$, me$)

  const react = history$.pipe(
    tag("history$"),
    switchMap((route) =>
      match(route.name)
        .with("root", () => landingView$)
        .with("in", () => authView$)
        .otherwise(() => landingView$)
    ),
    map((childView) => h(AppView, [childView])),
    catchError((error, caught$) => {
      // TODO: wrap sentry call, include logging
      captureException(error)
      console.error(error)
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
