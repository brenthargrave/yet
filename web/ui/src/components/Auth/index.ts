import { useQuery } from "@apollo/client"
import { h } from "@cycle/react"
import { useState } from "react"
import { useAsync } from "react-use"

import type { Graph } from "~/components/App"
import { PhoneSubmit } from "./PhoneSubmit"
import { GetEventsDocument } from "~/graph/generated"

enum Step {
  Submit,
  Verify,
  Confirm,
}

interface Props {
  graph: Graph
}

export const Auth = ({ graph }: Props) => {
  const { data } = useQuery(GetEventsDocument)

  useAsync(async () => {
    const {
      data: { events },
    } = await graph.query({ query: GetEventsDocument })

    // const {
    //   data: { events },
    //   error,
    //   errors,
    //   loading,
    // } = result
    // console.debug(loading)
    // console.error(error)
    // console.error(errors)
    // console.debug(events)
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
