import { HStack, PinInput, PinInputField } from "@chakra-ui/react"
import { h } from "@cycle/react"
import { form } from "@cycle/react-dom"
import { Ref } from "react"
import { formatPhone, t } from "~/i18n"
import {
  ariaLabel,
  Button,
  Center,
  Heading,
  InputGroup,
  Stack,
  Text,
} from "~/system"

export interface Props {
  e164: string
  code: string
  onSubmit: () => void
  onComplete: (code: string) => void
  onChangeCodeInput: (code: string) => void
  isLoading: boolean
  isDisabledCodeInput: boolean
  isDisabledSubmitButton: boolean
  firstInputRef?: Ref<HTMLInputElement>
}

const size = "lg"

export const View = ({
  e164,
  code: value,
  onSubmit: _onSubmit,
  onComplete: _onComplete,
  onChangeCodeInput,
  isLoading,
  isDisabledCodeInput,
  isDisabledSubmitButton,
  firstInputRef,
}: Props) => {
  const onSubmit: React.FormEventHandler<HTMLButtonElement> = (event) => {
    event.preventDefault()
    _onSubmit()
  }

  const onComplete = (value: string) => {
    _onComplete(value)
  }

  return h(Center, { width: "100vw", height: "100vh" }, [
    h(Stack, { direction: "column", align: "center" }, [
      h(Heading, { size }, t("auth.tel.verify.head")),
      e164 &&
        h(
          Text,
          { fontSize: size },
          t("auth.tel.verify.cta").replace("$PHONE", formatPhone(e164))
        ),
      form({ onSubmit, autoComplete: "off" }, [
        h(
          InputGroup,
          {
            size,
            flexDirection: "column",
            gap: 2,
            ...ariaLabel("PIN number"),
          },
          [
            h(HStack, {}, [
              h(PinInput, {
                value,
                onChange: (value: string) => onChangeCodeInput(value),
                onComplete: (value: string) => onComplete(value),
                isDisabled: isDisabledCodeInput,
                autoFocus: true,
                manageFocus: true,
                type: "number",
                size,
                otp: true,
                children: [
                  h(PinInputField, { ref: firstInputRef }),
                  h(PinInputField),
                  h(PinInputField),
                  h(PinInputField),
                ],
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
                ...ariaLabel(t(`auth.tel.entry.submit`)),
              },
              t(`auth.tel.entry.submit`)
            ),
          ]
        ),
      ]),
    ]),
  ])
}
