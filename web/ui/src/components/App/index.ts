import { h } from "@cycle/react"
import { Fragment } from "react"

// import type { Client } from "graph"
import { context } from "~/context"
import { Landing } from "~/components/Landing"
import { Auth } from "~/components/Auth"
import { useRoute } from "~/router"

export const App = () => {
  const currentRoute = useRoute()
  return h(Fragment, [
    currentRoute.name === "home" && h(Landing),
    currentRoute.name === "in" && h(Auth, { context }),
  ])
}
