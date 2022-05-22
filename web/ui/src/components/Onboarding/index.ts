import { h, ReactSource } from "@cycle/react"
import { of } from "rxjs"

import { View } from "./View"

interface Sources {
  react: ReactSource
}

export const Onboarding = (sources: Sources) => {
  const react = of(h(View))

  return {
    react,
  }
}
