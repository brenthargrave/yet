import type { Route as _Route } from "type-route"
import { createRouter, defineRoute } from "type-route"

export const { routes, useRoute, RouteProvider, session } = createRouter({
  home: defineRoute("/"),
  in: defineRoute("/in"),
  out: defineRoute("/out"),
})

export type Route = _Route<typeof routes>

export const isRoute = (route: Route, expectedRoute: Route): boolean =>
  route.name === expectedRoute.name

const unlisten = session.listen((route) => {
  console.debug(route)
})
