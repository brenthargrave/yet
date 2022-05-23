import { h } from "@cycle/react"
import { form } from "@cycle/react-dom"

import { Button, Center, Stack, Heading, Input, InputGroup } from "~/system"

const size = "lg"

export interface Props {
  onChangeInput: (text: string) => void
  isSubmitButtonDisabled: boolean
  isInputDisabled: boolean
  onSubmit: () => void
  isLoading: boolean
  headingCopy: string
  inputPlaceholder: string
  submitButtonCopy: string
}
export const View = ({
  onChangeInput,
  isSubmitButtonDisabled,
  isInputDisabled,
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
  const onChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const { value } = e.currentTarget
    onChangeInput(value)
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
            onChange,
            isDisabled: isInputDisabled,
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
