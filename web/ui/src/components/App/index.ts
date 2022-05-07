import { h, ReactSource } from "@cycle/react"
import { combineLatest } from "rxjs"
import { map, share } from "rxjs/operators"
import { match } from "ts-pattern"

import { Source as RouterSource } from "~/router"
import { View as AppView } from "./View"
import { Landing } from "~/components/Landing"
import { PhoneSubmit } from "~/components/Auth/PhoneSubmit"

interface Sources {
  react: ReactSource
  router: RouterSource
}
export const App = (sources: Sources) => {
  const { history$ } = sources.router
  const { react: landingView$ } = Landing(sources)
  const { react: phoneSubmitView$ } = PhoneSubmit(sources)

  const react = combineLatest({
    route: history$,
    landing: landingView$,
    phoneSubmit: phoneSubmitView$,
  }).pipe(
    map(({ route, landing, phoneSubmit }) => {
      const childView = match(route.name)
        .with("home", () => landing)
        .with("in", () => phoneSubmit)
        .otherwise(() => landing) // TODO: .exhaustive()
      return h(AppView, [childView])
    }),
    share()
  )

  return {
    react,
  }
}
