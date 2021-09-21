import { h } from "@cycle/react"
import { useState } from "react"
import { phone as validatePhone } from "phone"

import { view } from "./view"

export const PhoneSubmit = () => {
  const [phone, setPhone] = useState("")
  const [isDisabled, setDisabled] = useState<boolean>(true)
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
    console.debug("sumibtting")
    setDisabled(true)
    // TODO: submit phone to api
    // get back ok -> call success()
    // get back error -> where render error? how make preview?
    // Graphql or no?
  }

  return h(view, { phone, onChangePhone, isDisabled, onSubmit })
}
