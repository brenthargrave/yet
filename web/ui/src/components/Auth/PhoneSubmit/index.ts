import { h } from "@cycle/react"
import { useState } from "react"
import { phone as validatePhone } from "phone"
import { useMutation } from "@apollo/client"

import { View } from "./View"
import { CreateVerificationDocument } from "~/graph/generated"

export const PhoneSubmit = () => {
  const [phone, setPhone] = useState("")
  const [isDisabled, setDisabled] = useState<boolean>(true)
  const [mutate, { loading }] = useMutation(CreateVerificationDocument)

  const onChangePhone: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    const { value } = event.currentTarget
    setPhone(value)
    const { isValid } = validatePhone(value, {
      country: "USA",
      strictDetection: true,
    })
    setDisabled(!isValid || loading)
  }

  const onSubmit: React.FormEventHandler<HTMLButtonElement> = async (event) => {
    event.preventDefault()
    console.debug(event)
    setDisabled(true)
    const { data, errors } = await mutate()
    if (data) console.debug(data)
    // if (errors) console.error(errors)
    // TODO:
    // error -> render errors globally, send non-user errors to sentry
    // ok -> next screen
  }

  return h(View, {
    phone,
    onChangePhone,
    isDisabled,
    onSubmit,
    isLoading: loading,
  })
}
