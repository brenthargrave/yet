import { CheckIcon } from "@chakra-ui/icons"
import { h } from "@cycle/react"
import { ActionButton } from "~/system"

export interface Props {
  onClick?: () => void
  isDisabled?: boolean
  isLoading?: boolean
}

export const SignButton = ({ onClick, isDisabled, isLoading }: Props) =>
  h(ActionButton, {
    cta: "Cosign",
    rightIcon: h(CheckIcon),
    onClick,
    isDisabled,
    isLoading,
  })

SignButton.displayName = "SignButton"
