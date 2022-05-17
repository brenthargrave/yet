import { h } from "@cycle/react"
import { form } from "@cycle/react-dom"
import RestrictedInput from "restricted-input"
import { useEffectOnce } from "react-use"

import {
  InputAddon,
  Button,
  Center,
  Stack,
  Heading,
  Input,
  InputGroup,
} from "~/system"
import { t, formatPhone } from "~/i18n"

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
  const phoneInputId = "phone-number"
  const phoneInputHandler: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const { value } = e.currentTarget
    onChangePhoneInput(value)
  }
  useEffectOnce(() => {
    // TODO: extract react-compat format function from RestrictedInput
    // eslint-disable-next-line
    const element = document.querySelector(`#${phoneInputId}`)!
    // eslint-disable-next-line
    const input = new RestrictedInput({
      // @ts-ignore
      element,
      pattern: "({{999}}) {{999}}-{{9999}}",
    })
    // @ts-ignore
    element.addEventListener("input", phoneInputHandler, false)
  })
  return h(Center, { width: "100vw", height: "100vh" }, [
    form({ onSubmit }, [
      h(Stack, { direction: "column", align: "center", gap: 2 }, [
        h(Heading, { size }, t("auth.tel.entry.cta")),

        h(InputGroup, { size }, [
          h(InputAddon, { children: "+1" }),
          h(Input, {
            id: "phone-number",
            autoFocus: true,
            type: "tel",
            placeholder: t("auth.tel.entry.placeholder"),
            isRequired: true,
            onChange: phoneInputHandler,
            isDisabled: isPhoneInputDisabled,
          }),
        ]),
        h(
          Button,
          {
            isDisabled: isSubmitButtonDisabled,
            size,
            width: "100%",
            isLoading,
            type: "submit",
          },
          t(`auth.tel.entry.submit`)
        ),
      ]),
    ]),
  ])
}
