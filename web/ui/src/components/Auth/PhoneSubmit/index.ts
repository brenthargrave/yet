import { h } from "@cycle/react"
import { useState } from "react"
import { phone as validatePhone } from "phone"

import { View } from "./View"

export const PhoneSubmit = () => {
  const [phone, setPhone] = useState("")
  const [isDisabled, setDisabled] = useState<boolean>(true)
  const [isLoading, setLoading] = useState<boolean>(false)
  const onChangePhone: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    const { value } = event.currentTarget
    setPhone(value)
    const { isValid } = validatePhone(value, {
      country: "USA",
      strictDetection: true,
    })
    setDisabled(!isValid)
  }
  const onSubmit = async () => {
    console.debug("submit")
    setDisabled(true)
    setLoading(true)
    /*
    - phx/absinthe mutation: SubmitPhone
    - generate local schema/queries
    - call w/ apollo
    TODO submit phone to api
      ok -> call onSuccess(), how nav to next step?
      error -> where render error? how make preview?

     */
  }

  return h(View, { phone, onChangePhone, isDisabled, onSubmit, isLoading })
}
