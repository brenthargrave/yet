import { useQuery, useMutation } from "@apollo/client"
import { h } from "@cycle/react"
import { useState } from "react"
import { useAsync } from "react-use"

import type { Graph } from "~/components/App"
import { PhoneSubmit } from "./PhoneSubmit"
import {
  CreateVerificationDocument,
  GetEventsDocument,
} from "~/graph/generated"

enum Step {
  Submit,
  Verify,
  Confirm,
}

interface Props {
  graph: Graph
}

export const Auth = ({ graph }: Props) => {
  // const { data } = useQuery(GetEventsDocument)
  const [createVerification, { data, loading }] = useMutation(
    CreateVerificationDocument
  )

  useAsync(async () => {
    // const result = await createVerification({
    //   variables: {
    //     input: { e164: "+19099103449" },
    //   },
    // })
    // result.data?.createVerification?.status

    // const {
    //   data: { events },
    // } = await graph.query({ query: GetEventsDocument })
    const result = await graph.mutate({ mutation: CreateVerificationDocument })
    // result.data?.createVerification?.status
  })

  const [step, setStep] = useState(Step.Submit)
  const view = h(PhoneSubmit)
  // switch (step) {
  //   case Step.Submit:
  //   case Step.Verify:
  //   case Step.Confirm:
  // }

  return view
}
