import { useMutation } from "@apollo/client"
import { h } from "@cycle/react"
import { useState } from "react"
import { useAsync } from "react-use"

import type { Graph } from "~/components/App"
import { PhoneSubmit } from "./PhoneSubmit"
import { CreateVerificationDocument } from "~/graph/generated"

// enum Step {
//   Submit,
//   Verify,
//   Confirm,
// }

interface Props {
  graph: Graph
}

export const Auth = ({ graph }: Props) => {
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
