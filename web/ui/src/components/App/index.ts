import { h } from "@cycle/react"
import { Fragment } from "react"

import type { Client } from "graph"
import { Landing } from "~/components/Landing"
import { Auth } from "~/components/Auth"
import { useRoute } from "~/router"

interface Props {
  client: Client
}

export const App = ({ client }: Props) => {
  const route = useRoute()
  return h(Fragment, [
    route.name === "home" && h(Landing),
    route.name === "in" && h(Auth, { graph: client }),
  ])
}
