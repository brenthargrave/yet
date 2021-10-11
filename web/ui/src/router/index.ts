import type { Route as _Route } from "type-route"
import { createRouter, defineRoute } from "type-route"
import { Observable } from "rxjs"

export const { routes, useRoute, RouteProvider, session } = createRouter({
  home: defineRoute("/"),
  in: defineRoute("/in"),
  out: defineRoute("/out"),
  verify: defineRoute("/verify"),
})

export type Route = _Route<typeof routes>

export const isRoute = (route: Route, expectedRoute: Route): boolean =>
  route.name === expectedRoute.name

export const history$ = new Observable<Route>((observer) => {
  const unlisten = session.listen((route) => {
    observer.next(route)
  })
  return unlisten
})

export const driver = {
  history$,
}
