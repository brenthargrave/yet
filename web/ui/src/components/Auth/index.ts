import { h } from "@cycle/react"
import { useState } from "react"

import { PhoneSubmit } from "./PhoneSubmit"

/**
 * how manage steps?
 * PhoneSubmit, PhoneVerify, PhoneConfirmed
 * how go backwards in process from verify if confused?
 */

enum Step {
  Submit,
  Verify,
  Confirm,
}

export const Auth = () => {
  const [step, setStep] = useState(Step.Submit)
  const view = h(PhoneSubmit)
  // switch (step) {
  //   case Step.Submit:
  //   case Step.Verify:
  //   case Step.Confirm:
  // }
  return view
}
