import { DeleteIcon } from "@chakra-ui/icons"
import { Button } from "@chakra-ui/react"
import { h } from "@cycle/react"

export interface Props {
  onClick?: () => void
  isLoading?: boolean
  isDisabled?: boolean
}

export const DeleteButton = ({ onClick, isLoading, isDisabled }: Props) =>
  h(
    Button,
    {
      leftIcon: h(DeleteIcon),
      size: "xs",
      variant: "outline",
      onClick,
      isLoading,
      loadingText: "Deleting...",
      isDisabled,
    },
    `Delete`
  )
