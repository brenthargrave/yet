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
import { routes } from "~/router"

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
    }
  }

  return h(View, {
    phone,
    onChangePhone,
    isDisabled,
    onSubmit,
    isLoading: loading,
  })
}
