import { h, ReactSource } from "@cycle/react"
import { of } from "rxjs"
import { Source as RouterSource } from "~/router"
import { View } from "./View"

interface Sources {
  react: ReactSource
  router: RouterSource
}

export const Conversations = (sources: Sources) => {
  const react = of(h(View, {}))

  return {
    react,
  }
}
