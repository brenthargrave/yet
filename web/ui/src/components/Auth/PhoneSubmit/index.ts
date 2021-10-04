import { h } from "@cycle/react"
import { useState } from "react"
import { phone as validatePhone } from "phone"
import { useMutation } from "@apollo/client"
import {
  CreateVerificationDocument,
  VerificationStatus,
} from "~/graph/generated"

import { isPresent } from "~/fp"
import { View } from "./View"
import { Context } from "~/context"

interface Props {
  context: Context
}
export const PhoneSubmit = ({ context }: Props) => {
  const [phone, setPhone] = useState("")
  const [isButtonDisabled, setButtonDisabled] = useState<boolean>(true)
  const [isInputDisabled, setInputDisabled] = useState<boolean>(false)
  const [mutate, { loading }] = useMutation(CreateVerificationDocument)

  const onChangePhone: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    const { value } = event.currentTarget
    setPhone(value)
    const { isValid } = validatePhone(value, {
      country: "USA",
      strictDetection: true,
    })
    setButtonDisabled(!isValid || loading)
  }

  const onSubmit: React.FormEventHandler<HTMLButtonElement> = async (event) => {
    event.preventDefault()
    setButtonDisabled(true)
    setInputDisabled(true)
    // TODO: how to forward errors up to global notifications?
    // if use hooks, surely need to wrap the hook?
    const { data, errors } = await mutate({
      variables: { input: { e164: phone } },
    })
    if (isPresent(errors)) {
      context.errors$.next(errors)
    }
    if (data) console.debug(data)
    if (data?.createVerification?.successful) {
      const status: VerificationStatus | undefined =
        data.createVerification.result?.status
      const approved = status === VerificationStatus.Approved
      // if (approved) routes.ho
      // TODO: next screen
      setInputDisabled(false)
    }
  }

  return h(View, {
    phone,
    onChangePhone,
    isButtonDisabled,
    isInputDisabled,
    onSubmit,
    isLoading: loading,
  })
}
