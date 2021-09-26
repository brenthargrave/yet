import { createRouter, defineRoute } from "type-route"

export const { routes, useRoute, RouteProvider, session } = createRouter({
  home: defineRoute("/"),
  in: defineRoute("/in"),
  out: defineRoute("/out"),
})

const unlisten = session.listen((route) => {
  console.debug(route)
})
