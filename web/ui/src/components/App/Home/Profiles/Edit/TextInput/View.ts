import { FormControl, FormErrorMessage, FormHelperText } from "@chakra-ui/react"
import { h } from "@cycle/react"
import { FC } from "react"
import { Maybe } from "~/graph"
import { ariaLabel, Input } from "~/system"

export type InputType = string | null | undefined

export interface Props<T> {
  defaultValue: T
  label: string
  isDisabled?: boolean
  onChange?: (value: T) => void
  autoFocus?: boolean
  placeholder?: string
  isInvalid?: boolean
  errorMessage?: Maybe<string>
  size?: string
}

export const View: FC<Props<InputType>> = ({
  label,
  onChange: _onChange,
  defaultValue,
  isDisabled = true,
  autoFocus = false,
  placeholder,
  isInvalid,
  errorMessage,
  size,
  ...props
}) => {
  const onChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    const next = event.target.value
    if (_onChange) _onChange(next)
  }
  return h(FormControl, { isInvalid, size }, [
    h(Input, {
      ...ariaLabel(label),
      defaultValue,
      autoFocus,
      onChange,
      placeholder,
      size,
      autoComplete: "off",
    }),
    isInvalid
      ? errorMessage && h(FormErrorMessage, {}, errorMessage)
      : // NOTE: needed to keep inputs horizonally aligned on error
        h(FormHelperText, {}, "\u00A0"),
  ])
}
