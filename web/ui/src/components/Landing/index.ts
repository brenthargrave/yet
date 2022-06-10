import { h, ReactSource } from "@cycle/react"
import { of } from "rxjs"

import { routes, Source as RouterSource } from "~/router"
import { EventName, track } from "~/graph"
import { CC, Sources } from "~/components/App"
import { View } from "./View"

export const Landing: CC<Sources> = (sources) => {
  const onClickJoin = async () => {
    routes.in().push()
    const _event = await track(EventName.TapSignup)
  }

  const onClickLogin = () => routes.in().push()

  const react = of(h(View, { onClickJoin, onClickLogin }))

  return {
    react,
  }
}

// export const Landing = () => {
//   const onClickJoin = async () => {
//     routes.in().push() // TODO: driver
//     const _event = await track(EventName.TapSignup)
//   }
//   const onClickLogin = () => null
//   return h(View, { onClickJoin, onClickLogin })
// }
