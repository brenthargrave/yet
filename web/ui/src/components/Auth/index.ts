import { useMutation } from "@apollo/client"
import { h } from "@cycle/react"

import { PhoneSubmit } from "./PhoneSubmit"
import { CreateVerificationDocument } from "~/graph/generated"

// enum Step {
//   Submit,
//   Verify,
//   Confirm,
// }

export const Auth = () => {
  const [createVerification, { data, loading }] = useMutation(
    CreateVerificationDocument
  )

  const onSubmit = async () => {
    console.debug("submitting")
    const result = await createVerification({
      variables: {
        input: { e164: "+19099103449" },
      },
    })
    const status = result.data?.createVerification?.result?.status
    // const result = await graph.mutate({ mutation: CreateVerificationDocument })
    // const status = result.data?.createVerification?.result?.status
    console.debug(status)
  }

  // useAsync(async () => {})

  // const [step, setStep] = useState(Step.Submit)
  const view = h(PhoneSubmit, { onSubmit })
  // switch (step) {
  //   case Step.Submit:
  //   case Step.Verify:
  //   case Step.Confirm:
  // }

  return view
}
