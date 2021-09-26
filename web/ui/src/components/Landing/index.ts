import { h } from "@cycle/react"
import { routes } from "~/router"

import { View } from "./View"

export const Landing = () => {
  const onClickJoin = () => routes.in().push()

  const onClickLogin = () => routes.in().push()

  return h(View, { onClickJoin, onClickLogin })
}
