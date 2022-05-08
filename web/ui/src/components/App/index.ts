import { h, ReactSource } from "@cycle/react"
import { combineLatest } from "rxjs"
import { map, share } from "rxjs/operators"
import { match } from "ts-pattern"

import * as React from "react"
import * as ReactDOM from "react-dom"

import { Source as RouterSource, useRoute } from "~/router"
import { View } from "./View"
import { Landing } from "~/components/Landing"
import { PhoneSubmitHooks as PhoneSubmit } from "~/components/Auth/PhoneSubmit"

// interface Sources {
//   react: ReactSource
//   router: RouterSource
// }
// export const App = (sources: Sources) => {
//   const { history$ } = sources.router
//   const { react: landingView$ } = Landing(sources)
//   const { react: phoneSubmitView$ } = PhoneSubmit(sources)

//   const react = combineLatest({
//     route: history$,
//     landing: landingView$,
//     phoneSubmit: phoneSubmitView$,
//   }).pipe(
//     map(({ route, landing, phoneSubmit }) => {
//       const childView = match(route.name)
//         .with("home", () => landing)
//         .with("in", () => phoneSubmit)
//         .otherwise(() => landing) // TODO: .exhaustive()
//       return h(View, [childView])
//     }),
//     share()
//   )

//   return {
//     react,
//   }
// }

export const App = () => {
  const route = useRoute()
  return h(View, [
    match(route.name)
      .with("home", () => h(Landing))
      .with("in", () => h(PhoneSubmit))
      .otherwise(() => h(Landing)),
    // TODO: .exhaustive()
  ])
}
