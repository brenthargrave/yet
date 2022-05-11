import { h, ReactSource } from "@cycle/react"
import { of } from "rxjs"
import { View } from "./View"

export { View }

interface Sources {
  react: ReactSource
}
export const PhoneVerify = (sources: Sources) => {
  const react = of(h(View))
  return {
    react,
  }
}
