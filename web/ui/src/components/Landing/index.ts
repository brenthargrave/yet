import { h, ReactSource } from "@cycle/react"
import { of } from "rxjs"

import { routes, Source as RouterSource } from "~/router"
import { EventName, track } from "~/graph"
import { View } from "./View"

interface Sources {
  react: ReactSource
  router: RouterSource
}

export const Landing = (_sources: Sources) => {
  const onClickJoin = async () => {
    routes.in().push() // TODO: make driver
    const _event = await track(EventName.TapSignup)
  }

  const onClickLogin = () => null

  const react = of(h(View, { onClickJoin, onClickLogin }))

  return {
    react,
  }
}
