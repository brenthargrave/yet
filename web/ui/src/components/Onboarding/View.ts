import { h } from "@cycle/react"
import { form } from "@cycle/react-dom"
import { Ref } from "react"
import {
  ariaLabel,
  Button,
  Center,
  Heading,
  Input,
  InputGroup,
  Stack,
} from "~/system"
import { toLower } from "~/fp"
import { ProfileProp } from "~/graph"

const size = "lg"

export interface Props {
  attr: string
  onChangeInput: (text: string) => void
  isSubmitButtonDisabled: boolean
  isInputDisabled: boolean
  onSubmit: () => void
  isLoading: boolean
  headingCopy: string
  inputPlaceholder: string
  submitButtonCopy: string
  formRef?: Ref<HTMLFormElement>
  inputRef?: Ref<HTMLInputElement>
  buttonRef?: Ref<HTMLButtonElement>
}

export const View = ({
  attr,
  onChangeInput,
  isSubmitButtonDisabled,
  isInputDisabled,
  onSubmit: _onSubmit,
  isLoading,
  headingCopy,
  inputPlaceholder,
  submitButtonCopy,
  inputRef,
  formRef,
  buttonRef,
}: Props) => {
  const key = `input-${attr}`
  const onSubmit: React.FormEventHandler<HTMLButtonElement> = (e) => {
    e.preventDefault()
    _onSubmit()
  }
  const onChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const { value } = e.currentTarget
    onChangeInput(value)
  }
  return h(Center, { key, width: "100%", height: "100%" }, [
    form({ onSubmit, ref: formRef }, [
      h(Center, { width: "100vw", height: "100vh" }, [
        h(Stack, { direction: "column", align: "center", gap: 2 }, [
          h(Heading, { size }, headingCopy),
          h(InputGroup, { size, key: `group-${attr}` }, [
            h(Input, {
              ref: inputRef,
              type: attr === ProfileProp.Email ? "email" : null,
              autoFocus: true,
              placeholder: inputPlaceholder,
              isRequired: true,
              onChange,
              isDisabled: isInputDisabled,
              ...ariaLabel(toLower(attr)),
            }),
          ]),
          h(
            Button,
            {
              ref: buttonRef,
              isDisabled: isSubmitButtonDisabled,
              size,
              width: "100%",
              isLoading,
              type: "submit",
              ...ariaLabel(submitButtonCopy),
            },
            submitButtonCopy
          ),
        ]),
      ]),
    ]),
  ])
}
