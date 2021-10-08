import { h } from "@cycle/react"
import { useState } from "react"
import { phone as validatePhone } from "phone"
import { VerificationStatus } from "~/graph/generated"

import { View } from "./View"
import { Context } from "~/context"
import { signin } from "~/graph"

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
    // TODO: instead of messages, map to own designed error w/ single message
    const result = await signin({ e164 })
    switch (result.__typename) {
      case "Verification":
        console.debug(result.status)
        // switch (result.status) {
        //   case VerificationStatus.Pending:
        //     console.debug("PENDING")
        //     break
        //   case VerificationStatus.Approved:
        // }
        // TODO pending? go to /verify
        // cancelled? alert: phone verification cancelled; please try again
        // approved? (should be impossible!)

        break
      case "VerificationError":
        break
    }
    /*
    if (result) {
      const { status } = result
      switch (status) {
        case VerificationStatus.Pending:
          console.debug("PENDING")
        // TODO pending? go to /verify
        // cancelled? alert: phone verification cancelled; please try again
        // approved? (should be impossible!)
      }
    } else {
      const { message } = error
      // TODO - context.notifications$.next(error, messsage)
    }
     */
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
