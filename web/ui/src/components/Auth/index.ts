// can't compose views only, if fractal, so how build up entire view preview?
// honestly, unclear how any different from React arch then.

import { h } from "@cycle/react"
import { useState } from "react"

// import { View as SubmitView, Submit } from "submit"
// import { View, VerificationStep } from "./View"

/**
const Auth$ = () => {
  const submitView$ = Submit(sources)
  let verifyView$
  const react = combineLatest(submitView, veirfyView]) = h(View, {
    submitView,
    verifyView,
  }))
  // right, so the preview needs to build up subviews on its own
  // how replicate in vanilla react?
}
 */

// const Auth = () => {
//   const [step, setStep] = useState<VerificationStep>(VerificationStep.Submit)
//   const onPending = () => setStep(VerificationStep.Verify)
//   return h(View, { step, onPending, submitView: h(SubmitView) })
// }
