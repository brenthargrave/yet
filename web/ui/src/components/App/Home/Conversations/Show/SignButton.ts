import { CheckIcon } from "@chakra-ui/icons"
import { h } from "@cycle/react"
import { ActionButton } from "~/system"

export interface Props {
  onClickSign?: () => void
  isDisabled?: boolean
  isSignLoading?: boolean
}

export const SignButton = ({ onClickSign, isDisabled, isSignLoading }: Props) =>
  h(ActionButton, {
    cta: "Cosign",
    rightIcon: h(CheckIcon),
    onClick: onClickSign,
    isLoading: isSignLoading,
    isDisabled,
  })

SignButton.displayName = "SignButton"
