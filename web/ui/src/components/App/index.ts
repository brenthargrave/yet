import { h, ReactSource } from "@cycle/react"
import { combineLatest, catchError } from "rxjs"
import { map, share } from "rxjs/operators"
import { match } from "ts-pattern"

import { Source as RouterSource } from "~/router"
import { View as AppView } from "./View"
import { Landing } from "~/components/Landing"
import { Auth } from "~/components/Auth"
import { toast } from "~/toast"

interface Sources {
  react: ReactSource
  router: RouterSource
}
export const App = (sources: Sources) => {
  const { history$ } = sources.router
  const { react: landingView$ } = Landing(sources)
  const { react: authView$ } = Auth(sources)

  const react = combineLatest({
    route: history$,
    landing: landingView$,
    auth: authView$,
  }).pipe(
    map(({ route, landing, auth }) => {
      return h(AppView, [
        match(route.name)
          .with("home", () => landing)
          .with("in", () => auth)
          .otherwise(() => landing),
        // TODO: exhaustive
      ])
    }),
    catchError((error, caught$) => {
      console.error(error)
      // TODO: captureException(error)
      toast({
        title: "Error!",
        description: error.message,
        status: "error",
      })
      return caught$
    }),
    share()
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
