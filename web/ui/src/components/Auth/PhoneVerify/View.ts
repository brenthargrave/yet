import { h } from "@cycle/react"
import { useState } from "react"
import { form } from "@cycle/react-dom"
import {
  Button,
  Center,
  Stack,
  Heading,
  Input,
  InputGroup,
  Text,
} from "~/system"
import { t } from "~/i18n"

export interface Props {
  codeLength: number
  e164: string
  onSubmit: React.FormEventHandler<HTMLButtonElement>
  isLoading: boolean
  isDisabledInput: boolean
}

const size = "lg"

export const View = ({
  codeLength,
  e164,
  onSubmit,
  isLoading,
  isDisabledInput,
}: Props) => {
  const phone = e164
  const [isDisabledButton, setDisabledButton] = useState(true)
  const onChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    const { value } = event.currentTarget
    setDisabledButton(value.length !== codeLength)
  }
  return h(Center, { width: "100vw", height: "100vh" }, [
    h(Stack, { direction: "column", align: "center" }, [
      h(Heading, { size }, t("auth.tel.verify.head")),
      h(
        Text,
        { fontSize: size },
        t("auth.tel.verify.cta").replace("$PHONE", phone)
      ),
      form({ onSubmit }, [
        h(InputGroup, { size }, [
          h(Input, {
            id: "code",
            autoFocus: true,
            type: "number",
            placeholder: t("auth.tel.verify.placeholder"),
            isRequired: true,
            onChange,
            isDisabled: isDisabledInput,
          }),
        ]),
        h(
          Button,
          {
            isDisabled: isDisabledButton,
            isLoading,
            size,
            width: "100%",
            type: "submit",
          },
          t(`auth.tel.entry.submit`)
        ),
      ]),
    ]),
  ])
}
