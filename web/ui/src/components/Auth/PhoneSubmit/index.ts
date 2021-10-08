import { h } from "@cycle/react"
import { useState } from "react"
import { phone as validatePhone } from "phone"

import { View } from "./View"
import { Context } from "~/context"
import { signin, VerificationStatus } from "~/graph"

interface Props {
  context: Context
}
export const PhoneSubmit = ({ context }: Props) => {
  const [phone, setPhone] = useState("")
  const [e164, setE164] = useState("")
  const [isButtonDisabled, setButtonDisabled] = useState<boolean>(true)
  const [isInputDisabled, setInputDisabled] = useState<boolean>(false)
  const [isLoading, setLoading] = useState(false)

  const onChangePhone: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    const { value } = event.currentTarget
    setPhone(value)
    const { isValid, phoneNumber } = validatePhone(value, {
      country: "USA",
      strictDetection: true,
    })
    setButtonDisabled(!isValid || isLoading)
    if (isValid && !!phoneNumber) {
      setE164(phoneNumber)
    }
  }

  const onSubmit: React.FormEventHandler<HTMLButtonElement> = async (event) => {
    event.preventDefault()
    setLoading(true)
    setButtonDisabled(true)
    setInputDisabled(true)
    // TODO: analytics? action?
    const result = await signin({ e164 })
    switch (result.__typename) {
      case "VerificationError": {
        const { message } = result
        // TODO: alert message
        context.notifications.error
        // why would it be in context?
        break
      }
      case "Verification":
        console.debug(result.status)
        switch (result.status) {
          case VerificationStatus.Canceled:
            // TODO: alert "Phone numbers verification cancelled, please try again."
            break
          case VerificationStatus.Approved:
            // TODO: route home
            break
          case VerificationStatus.Pending:
            // TODO: route /verify
            break
        }
        break
    }
    setInputDisabled(false)
    setButtonDisabled(false)
    setLoading(false)
  }

  return h(View, {
    phone,
    onChangePhone,
    isButtonDisabled,
    isInputDisabled,
    onSubmit,
    isLoading,
  })
}
