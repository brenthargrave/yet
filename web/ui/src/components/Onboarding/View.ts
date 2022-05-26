import { h } from "@cycle/react"
import { form, h1 } from "@cycle/react-dom"
import { Button, Center, Heading, Input, InputGroup, Stack } from "~/system"

export enum State {
  Edit = "edit",
  Done = "done",
}

const size = "lg"

export interface Props {
  state: State
  onChangeInput: (text: string) => void
  inputValue: string
  isSubmitButtonDisabled: boolean
  isInputDisabled: boolean
  onSubmit: () => void
  isLoading: boolean
  headingCopy: string
  inputPlaceholder: string
  submitButtonCopy: string
}
export const View = ({
  state = State.Edit,
  onChangeInput,
  inputValue: value,
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
  return h(Center, { width: "100%", height: "100%" }, [
    form({ onSubmit }, [
      state === State.Done && h1("Done"),
      state === State.Edit &&
        h(Stack, { direction: "column", align: "center", gap: 2 }, [
          h(Heading, { size }, headingCopy),
          h(InputGroup, { size }, [
            h(Input, {
              value,
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
