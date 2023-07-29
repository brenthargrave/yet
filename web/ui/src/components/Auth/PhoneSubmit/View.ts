import { h } from "@cycle/react"
import { form } from "@cycle/react-dom"
import { useState } from "react"
import "react-international-phone/style.css"
import { t } from "~/i18n"
import { ariaLabel, Button, Center, Heading, Stack } from "~/system"
import { PhoneInput } from "./PhoneInput"

const size = "lg"

export interface Props {
  onChangePhoneInput: (text: string) => void
  isSubmitButtonDisabled: boolean
  isPhoneInputDisabled: boolean
  onSubmit: () => void
  isLoading: boolean
}

export const View = ({
  onChangePhoneInput,
  isSubmitButtonDisabled,
  isPhoneInputDisabled,
  onSubmit: _onSubmit,
  isLoading,
}: Props) => {
  const onSubmit: React.FormEventHandler<HTMLButtonElement> = (e) => {
    e.preventDefault()
    _onSubmit()
  }

  const [phone, _] = useState<string | undefined>()

  return h(Center, { width: "100vw", height: "100vh" }, [
    form({ onSubmit }, [
      h(Stack, { direction: "column", align: "center", gap: 2 }, [
        h(Heading, { size }, t("auth.tel.entry.cta")),
        h(PhoneInput, {
          value: phone,
          onChange: onChangePhoneInput,
          isPhoneInputDisabled,
        }),
        h(
          Button,
          {
            isDisabled: isSubmitButtonDisabled,
            size,
            width: "100%",
            isLoading,
            type: "submit",
            ...ariaLabel(t(`auth.tel.entry.submit`)),
          },
          t(`auth.tel.entry.submit`)
        ),
      ]),
    ]),
  ])
}
