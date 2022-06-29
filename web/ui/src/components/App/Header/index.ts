import { h, ReactSource } from "@cycle/react"
import { map, of } from "rxjs"
import { isRoute, routes, Source as RouterSource } from "~/router"
import { View } from "./View"

interface Sources {
  react: ReactSource
  router: RouterSource
}

export const Header = ({ router: { history$ } }: Sources) => {
  // const react = history$.pipe(
  //   map((route) => (isRoute(routes.root(), route) ? null : h(View)))
  // )
  // const react = of(h(View))
  const react = of(null)

  return {
    react,
  }
}
