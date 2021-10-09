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
import { t } from "~/i18n"

const size = "lg"

export interface Props {
  onChangePhone: React.ChangeEventHandler<HTMLInputElement>
  isButtonDisabled: boolean
  isInputDisabled: boolean
  onSubmit: React.FormEventHandler<HTMLButtonElement>
  isLoading: boolean
}
export const View = ({
  onChangePhone,
  isButtonDisabled,
  isInputDisabled,
  onSubmit,
  isLoading,
}: Props) => {
  const inputId = "phone-number"
  useEffectOnce(() => {
    // TODO: extract react-compat format function from RestrictedInput
    // eslint-disable-next-line
    const element = document.querySelector(`#${inputId}`)!
    // eslint-disable-next-line
    const input = new RestrictedInput({
      // @ts-ignore
      element,
      pattern: "({{999}}) {{999}}-{{9999}}",
    })
    // @ts-ignore
    element.addEventListener("input", onChangePhone, false)
  })
  return h(Center, { width: "100vw", height: "100vh" }, [
    h(Stack, { direction: "column", align: "center" }, [
      h(Heading, { size }, t("auth.tel.entry.cta")),
      form({ onSubmit }, [
        h(InputGroup, { size }, [
          h(InputAddon, { children: "+1" }),
          h(Input, {
            id: "phone-number",
            autoFocus: true,
            type: "tel",
            placeholder: t("auth.tel.entry.placeholder"),
            isRequired: true,
            onChange: onChangePhone,
            isDisabled: isInputDisabled,
          }),
        ]),
        h(
          Button,
          {
            isDisabled: isButtonDisabled,
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
