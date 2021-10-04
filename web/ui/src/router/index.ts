import { createRouter, defineRoute } from "type-route"

export const { routes, useRoute, RouteProvider, session } = createRouter({
  home: defineRoute("/"),
  in: defineRoute("/in"),
  out: defineRoute("/out"),
})

// @ts-ignore
export const isRoute = (route: Route, expectedRoute: Route): boolean =>
  route.name === expectedRoute.name

const unlisten = session.listen((route) => {
  console.debug(route)
})
