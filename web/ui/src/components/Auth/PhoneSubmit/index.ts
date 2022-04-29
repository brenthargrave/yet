import { h } from "@cycle/react"
import { useState } from "react"
import { phone as validatePhone } from "phone"

import { useEffectOnce } from "react-use"
import { View } from "./View"
import { Context } from "~/context"
import { signin, VerificationStatus } from "~/graph"
import { Notify } from "~/components/App/View"
import { routes } from "~/router"

interface Props {
  context: Context
  notify: Notify
}
export const PhoneSubmit = ({ context, notify }: Props) => {
  const [e164, setE164] = useState("")
  const [isButtonDisabled, setButtonDisabled] = useState<boolean>(true)
  const [isInputDisabled, setInputDisabled] = useState<boolean>(false)
  const [isLoading, setLoading] = useState(false)

  useEffectOnce(() => {
    // TODO: track("viewed submit phone")
  })

  const onChangePhone: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    const { value } = event.currentTarget
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
    // TODO: track("submitted phone number")
    setLoading(true)
    setButtonDisabled(true)
    setInputDisabled(true)
    const result = await signin({ e164 })
    switch (result.__typename) {
      case "VerificationError": {
        notify({ status: "error", title: result.message })
        break
      }
      case "Verification":
        console.debug(result.status)
        switch (result.status) {
          case VerificationStatus.Canceled:
            notify({
              title: "Verification cancelled, please try again.",
              status: "warning",
            })
            break
          case VerificationStatus.Pending:
            // TODO: track("viewed verify phone")
            routes.verify().push()
            break
          case VerificationStatus.Approved:
            // TODO: skip verify, *MUST* be auth token, so route home
            break
        }
        break
    }
    setInputDisabled(false)
    setButtonDisabled(false)
    setLoading(false)
  }

  return h(View, {
    onChangePhoneInput: onChangePhone,
    isButtonDisabled,
    isPhoneInputDisabled: isInputDisabled,
    onSubmit,
    isLoading,
  })
}
