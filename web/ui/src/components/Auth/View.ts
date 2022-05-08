import { h } from "@cycle/react"
import { View as SubmitView } from "./PhoneSubmit"
import { View as VerifyView } from "./PhoneVerify"

enum VerificationStep {
  Submit,
  Verify,
}

interface Props {
  step: VerificationStep
}

// export const View = ({ step, children }: Props) => {}
