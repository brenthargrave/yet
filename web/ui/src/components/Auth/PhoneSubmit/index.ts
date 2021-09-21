import { h } from "@cycle/react"
import { useState } from "react"
import { phone as validatePhone } from "phone"

import { view } from "./view"

export const PhoneSubmit = () => {
  const [phone, setPhone] = useState("")
  const [isDisabled, setDisabled] = useState<boolean>(true)
  const onChangePhone: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    setPhone(event.currentTarget.value)
    const { isValid } = validatePhone(phone, { country: "USA" })
    setDisabled(!isDisabled)
  }
  return h(view, { phone, onChangePhone, isDisabled })
}
