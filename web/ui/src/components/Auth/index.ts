import { h, ReactSource } from "@cycle/react"
import { useState } from "react"

import { PhoneSubmit } from "./PhoneSubmit"

// how let out compoentn know of state change?
// callback is simplest: onVerificationPending()

interface Sources {
  react: ReactSource
}
export const Auth = (sources: Sources) => {
  const { react: submitView$ } = PhoneSubmit(sources)

  // let verifyView$
  // const react = combineLatest(submitView, veirfyView]) = h(View, {
  //   submitView,
  //   verifyView,
  // }))
  // right, so the preview needs to build up subviews on its own
  // how replicate in vanilla react?
  const react = submitView$
  return {
    react,
  }
}

// const Auth = () => {
//   const [step, setStep] = useState<VerificationStep>(VerificationStep.Submit)
//   const onPending = () => setStep(VerificationStep.Verify)
//   return h(View, { step, onPending, submitView: h(SubmitView) })
// }
