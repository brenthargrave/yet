import { h, ReactSource } from "@cycle/react"
import { of } from "rxjs"
import { routes } from "~/router"

import { View } from "./View"

// export const Landing = () => {
//   const onClickJoin = () => routes.in().push()

//   const onClickLogin = () => routes.in().push()

//   return h(View, { onClickJoin, onClickLogin })
// }

interface Sources {
  react: ReactSource
}
export const Landing = (_: Sources) => {
  // TODO: action? intenet? rx?
  const onClickJoin = () => routes.in().push()
  const onClickLogin = () => routes.in().push()
  return {
    react: of(h(View, { onClickJoin, onClickLogin })),
  }
}
