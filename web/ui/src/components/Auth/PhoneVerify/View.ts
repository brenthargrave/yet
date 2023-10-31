import { HStack, Input, PinInput, PinInputField } from "@chakra-ui/react"
import { h } from "@cycle/react"
import { form } from "@cycle/react-dom"
import { Ref, useEffect, useMemo } from "react"
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

const PIN_CODE_LENGTH = 4

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

  // see: https://github.com/chakra-ui/chakra-ui/issues/4095#issuecomment-1790218229
  const isSafari = useMemo(
    () =>
      /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent),
    []
  )
  const isMobile = useMemo(
    () => /iPhone|iPad|iPod|Android/i.test(navigator.userAgent),
    []
  )
  const isIOS = useMemo(() => /iPhone|iPad|iPod/.test(navigator.userAgent), [])

  const needsWorkaround = useMemo(() => isSafari && isMobile && isIOS, [])

  useEffect(() => {
    if (needsWorkaround && value && value.length === PIN_CODE_LENGTH) {
      onComplete(value)
    }
  }, [value])
  //

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
              needsWorkaround
                ? h(Input, {
                    value,
                    onChange: ({
                      target: { value: newValue },
                    }: React.BaseSyntheticEvent<HTMLInputElement>) => {
                      onChangeCodeInput(newValue)
                    },
                    isDisabled: isDisabledCodeInput,
                    autoFocus: true,
                    type: "number",
                    size,
                    autoComplete: "one-time-code",
                    placeholder: "1234",
                    htmlSize: PIN_CODE_LENGTH,
                  })
                : h(PinInput, {
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
