import { h, ReactSource } from "@cycle/react"
import { of } from "rxjs"

import { routes, Source as RouterSource } from "~/router"
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
    await track(CLICK_SIGNUP, {
      installID,
    })
  }
  // const onClickLogin = () => onClickJoin()
  return {
    react: of(h(View, { onClickJoin, onClickLogin })),
  }
}
