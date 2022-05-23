import { h } from "@cycle/react"
import { form } from "@cycle/react-dom"

import { Button, Center, Stack, Heading, Input, InputGroup } from "~/system"

const size = "lg"

export interface Props {
  onChangePhoneInput: (text: string) => void
  isSubmitButtonDisabled: boolean
  isPhoneInputDisabled: boolean
  onSubmit: () => void
  isLoading: boolean
  headingCopy: string
  inputPlaceholder: string
  submitButtonCopy: string
}
export const View = ({
  onChangePhoneInput,
  isSubmitButtonDisabled,
  isPhoneInputDisabled,
  onSubmit: _onSubmit,
  isLoading,
  headingCopy,
  inputPlaceholder,
  submitButtonCopy,
}: Props) => {
  const onSubmit: React.FormEventHandler<HTMLButtonElement> = (e) => {
    e.preventDefault()
    _onSubmit()
  }
  const phoneInputHandler: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const { value } = e.currentTarget
    onChangePhoneInput(value)
  }
  return h(Center, { width: "100vw", height: "100vh" }, [
    form({ onSubmit }, [
      h(Stack, { direction: "column", align: "center", gap: 2 }, [
        h(Heading, { size }, headingCopy),
        h(InputGroup, { size }, [
          h(Input, {
            autoFocus: true,
            placeholder: inputPlaceholder,
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
          submitButtonCopy
        ),
      ]),
    ]),
  ])
}
