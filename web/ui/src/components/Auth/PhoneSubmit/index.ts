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
    // TODO: too sluggish; use rxjs
    const { isValid } = validatePhone(value, {
      country: "USA",
      strictDetection: true,
    })
    setDisabled(!isValid)
  }
  return h(view, { phone, onChangePhone, isDisabled })
}
