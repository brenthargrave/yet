import { h } from "@cycle/react"
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
  onSubmit: () => void
  onChangeCodeInput: (code: string) => void
  isLoading: boolean
  isDisabledCodeInput: boolean
  isDisabledSubmitButton: boolean
}

const size = "lg"

export const View = ({
  codeLength,
  e164,
  onSubmit: _onSubmit,
  onChangeCodeInput,
  isLoading,
  isDisabledCodeInput: isDisabledPhoneInput,
  isDisabledSubmitButton,
}: Props) => {
  const onSubmit: React.FormEventHandler<HTMLButtonElement> = (event) => {
    event.preventDefault()
    _onSubmit()
  }
  return h(Center, { width: "100vw", height: "100vh" }, [
    h(Stack, { direction: "column", align: "center" }, [
      h(Heading, { size }, t("auth.tel.verify.head")),
      h(
        Text,
        { fontSize: size },
        t("auth.tel.verify.cta").replace("$PHONE", e164)
      ),
      form({ onSubmit }, [
        h(InputGroup, { size }, [
          h(Input, {
            id: "code",
            autoFocus: true,
            type: "number",
            placeholder: t("auth.tel.verify.placeholder"),
            isRequired: true,
            onChange: (event) => {
              onChangeCodeInput(event.currentTarget.value)
            },
            isDisabled: isDisabledPhoneInput,
          }),
        ]),
        h(
          Button,
          {
            isDisabled: isDisabledSubmitButton,
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
