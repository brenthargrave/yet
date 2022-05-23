import { h, ReactSource } from "@cycle/react"
import { of } from "rxjs"

import { View } from "./View"

interface Sources {
  react: ReactSource
}

export const Onboarding = (sources: Sources) => {
  /*
  TODO: onboarding flow:
  - What's your name? (name)
  - Where do you work? (role)
  - What's your role there? (org)
  */
  const react = of(h(View))

  return {
    react,
  }
}
