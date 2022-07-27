import { AddIcon } from "@chakra-ui/icons"
import { Button } from "@chakra-ui/react"
import { h } from "@cycle/react"

export interface Props {
  onClick?: () => void
  isDisabled?: boolean
  isLoading?: boolean
}

export const SignButton = ({ onClick, isDisabled, isLoading }: Props) =>
  h(
    Button,
    {
      rightIcon: h(AddIcon),
      onClick,
      isDisabled,
      isLoading,
    },
    `Cosign`
  )

SignButton.displayName = "SignButton"
