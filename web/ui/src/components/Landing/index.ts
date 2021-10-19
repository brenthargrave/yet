import { h, ReactSource } from "@cycle/react"
import { of, from } from "rxjs"

import { routes, Source as RouterSource } from "~/router"
import { EventName, track } from "~/graph"
import { View } from "./View"

interface Sources {
  react: ReactSource
  router: RouterSource
}

export const Landing = (_sources: Sources) => {
  // TODO
  // const { join$, onClickJoin } = fromCallback...
  // const { login$, onClickLogin } = fromCallback...
  // const router = scheduled([join$, login$]).pipe(mergeAll().pipe(map(.in)))

  const onClickJoin = async () => {
    routes.in().push()
    const event = await track(EventName.TapSignup)
    console.debug(event)
    // how catch all unexpeced errors?
  }
  const onClickLogin = () => null

  const react = of(h(View, { onClickJoin, onClickLogin }))

  return {
    react,
  }
}
