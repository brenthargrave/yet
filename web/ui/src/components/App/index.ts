import { h, ReactSource } from "@cycle/react"
import { catchError } from "rxjs"
import { map, switchMap } from "rxjs/operators"
import { match } from "ts-pattern"
import { captureException } from "@sentry/react"

import { Source as RouterSource } from "~/router"
import { View as AppView } from "./View"
import { Landing } from "~/components/Landing"
import { Auth } from "~/components/Auth"
import { toast } from "~/toast"
import { t } from "~/i18n"
import { tag } from "~/log"

interface Sources {
  react: ReactSource
  router: RouterSource
}
export const App = (sources: Sources) => {
  const { history$ } = sources.router
  const { react: landingView$ } = Landing(sources)
  const { react: authView$ } = Auth(sources)

  const react = history$.pipe(
    tag("history$"),
    switchMap((route) =>
      match(route.name)
        .with("home", () => landingView$)
        .with("in", () => authView$)
        .otherwise(() => landingView$)
    ),
    map((childView) => h(AppView, [childView])),
    tag("App.react$"),
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
    })
  )

  return {
    react,
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
