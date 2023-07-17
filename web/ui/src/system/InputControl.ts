import {
  FormControl,
  FormControlProps,
  FormLabel,
  FormErrorMessage,
  FormHelperText,
} from "@chakra-ui/react"
import { h } from "@cycle/react"
import { FC } from "react"

interface Props extends FormControlProps {
  label?: string
  helperMessage?: string
  errorMessage?: string
}

export const InputControl: FC<Props> = ({
  label,
  isRequired,
  isDisabled,
  helperMessage,
  errorMessage,
  children,
  ...props
}) =>
  h(
    FormControl,
    { isRequired, isDisabled, isInvalid: !!errorMessage, ...props },
    [
      label && h(FormLabel, label),
      children,
      helperMessage && h(FormHelperText, helperMessage),
      errorMessage && h(FormErrorMessage, errorMessage),
    ]
  )
