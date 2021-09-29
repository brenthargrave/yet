import { h } from "@cycle/react"
import { useState } from "react"
import { phone as validatePhone } from "phone"
import { useMutation } from "@apollo/client"
import { CreateVerificationDocument } from "~/graph/generated"

import { isPresent } from "~/fp"
import { View } from "./View"
import { Context } from "~/context"

interface Props {
  context: Context
}
export const PhoneSubmit = ({ context }: Props) => {
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
    setDisabled(true)
    const { data, errors } = await mutate({
      variables: { input: { e164: phone } },
    })
    if (isPresent(errors)) {
      context.errors$.next(errors)
    }
    // TODO: ok -> next screen
    if (data) console.debug(data)
  }

  return h(View, {
    phone,
    onChangePhone,
    isDisabled,
    onSubmit,
    isLoading: loading,
  })
}
