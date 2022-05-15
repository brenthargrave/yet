import { h } from "@cycle/react"
import { form } from "@cycle/react-dom"
import { HStack, PinInput, PinInputField } from "@chakra-ui/react"
import {
  Button,
  Center,
  Stack,
  Heading,
  Input,
  InputGroup,
  Text,
} from "~/system"
import { t, formatPhone } from "~/i18n"

export interface Props {
  e164: string
  onSubmit: () => void
  onComplete: (code: string) => void
  onChangeCodeInput: (code: string) => void
  isLoading: boolean
  isDisabledCodeInput: boolean
  isDisabledSubmitButton: boolean
}

const size = "lg"

export const View = ({
  e164,
  onSubmit: _onSubmit,
  onComplete,
  onChangeCodeInput,
  isLoading,
  isDisabledCodeInput,
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
        t("auth.tel.verify.cta").replace("$PHONE", formatPhone(e164))
      ),
      form({ onSubmit, autoComplete: "off" }, [
        // h(InputGroup, { size }, [
        h(HStack, [
          h(PinInput, {
            onChange: (value: string) => onChangeCodeInput(value),
            onComplete: (value: string) => onComplete(value),
            isDisabled: isDisabledCodeInput,
            autoFocus: true,
            manageFocus: true,
            type: "number",
            size,
            otp: true,
            children: [
              h(PinInputField),
              h(PinInputField),
              h(PinInputField),
              h(PinInputField),
            ],
          }),
        ]),
        // TODO: drop Button? Input completion triggers submit.
        // h(
        //   Button,
        //   {
        //     isDisabled: isDisabledSubmitButton,
        //     isLoading,
        //     size,
        //     width: "100%",
        //     type: "submit",
        //   },
        //   t(`auth.tel.entry.submit`)
        // ),
      ]),
    ]),
  ])
}
