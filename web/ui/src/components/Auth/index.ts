import { h } from "@cycle/react"

import { PhoneSubmit } from "./PhoneSubmit"
import { Context } from "~/context"

// enum Step {
//   Submit,
//   Verify,
//   Confirm,
// }

interface Props {
  context: Context
  notify: (message: string) => void
}
export const Auth = ({ context, notify }: Props) => {
  // switch (step) {
  //   case Step.Submit:
  //   case Step.Verify:
  //   case Step.Confirm:
  // }
  // const [step, setStep] = useState(Step.Submit)
  return h(PhoneSubmit, { context })
}
