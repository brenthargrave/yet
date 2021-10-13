import { h, ReactSource } from "@cycle/react"
import { of } from "rxjs"

import { routes, Source as RouterSource } from "~/router"
import { View } from "./View"

interface Sources {
  react: ReactSource
  router: RouterSource
}

export const Landing = (_sources: Sources) => {
  // TODO: analytics!
  // TODO: use rxjs instead of callbacks?
  const onClickJoin = () => routes.in().push()
  const onClickLogin = () => routes.in().push()
  return {
    react: of(h(View, { onClickJoin, onClickLogin })),
  }
}
