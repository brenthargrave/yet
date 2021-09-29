import { h } from "@cycle/react"
import { Fragment } from "react"

import type { Client } from "graph"
import { Landing } from "~/components/Landing"
import { Auth } from "~/components/Auth"
import { useRoute, routes } from "~/router"

interface Props {
  client: Client
}

export const App = ({ client }: Props) => {
  const currentRoute = useRoute()
  return h(Fragment, [
    currentRoute.name === "home" && h(Landing),
    currentRoute.name === "in" && h(Auth, { graph: client }),
  ])
}
