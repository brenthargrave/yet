import { h, ReactSource } from "@cycle/react"
import { of } from "rxjs"

import { routes } from "~/router"
import { View } from "./View"

interface Sources {
  react: ReactSource
}

export const Landing = (_: Sources) => {
  // TODO: wrap routes
  // TODO: analytics!
  // TODO: use rxjs instead of callbacks?
  const onClickJoin = () => routes.in().push()
  const onClickLogin = () => routes.in().push()
  return {
    react: of(h(View, { onClickJoin, onClickLogin })),
  }
}
