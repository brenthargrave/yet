import { h } from "@cycle/react"
import React from "react"
import { form } from "@cycle/react-dom"
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
  phone: string
  onChangePhone: React.ChangeEventHandler<HTMLInputElement>
  isButtonDisabled: boolean
  isInputDisabled: boolean
  onSubmit: React.FormEventHandler<HTMLButtonElement>
  isLoading: boolean
}
export const View = ({
  phone,
  onChangePhone,
  isButtonDisabled,
  isInputDisabled,
  onSubmit,
  isLoading,
}: Props) => {
  return h(Center, { width: "100vw", height: "100vh" }, [
    h(Stack, { direction: "column", align: "center" }, [
      h(Heading, { size }, t("auth.tel.entry.cta")),
      // TODO: focus on first render
      form({ onSubmit }, [
        h(InputGroup, { size }, [
          h(InputAddon, { children: "+1" }),
          h(Input, {
            type: "tel",
            placeholder: t("auth.tel.entry.placeholder"),
            isRequired: true,
            value: phone,
            onChange: onChangePhone,
            isDisabled: isInputDisabled,
          }),
        ]),
        h(
          Button,
          { isDisabled: isButtonDisabled, size, width: "100%", isLoading },
          t(`auth.tel.entry.submit`)
        ),
      ]),
    ]),
  ])
}
