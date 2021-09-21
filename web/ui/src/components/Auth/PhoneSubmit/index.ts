import { h } from "@cycle/react"
import { useState } from "react"

import { view } from "./view"

export const PhoneSubmit = () => {
  const [phone, setPhone] = useState("")
  const onChangePhone: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    setPhone(event.currentTarget.value)
  }
  return h(view, { phone, onChangePhone })
}
