import { DeleteIcon } from "@chakra-ui/icons"
import { Button } from "@chakra-ui/react"
import { h } from "@cycle/react"
import { FC } from "react"

interface Props {
  onClick?: () => void
  isLoading?: boolean
  isDisabled?: boolean
}

export const DeleteButton: FC<Props> = ({ onClick, isLoading, isDisabled }) =>
  h(
    Button,
    {
      tabIndex: -1, // prevent focus
      leftIcon: h(DeleteIcon),
      size: "xs",
      variant: "ghost",
      onClick,
      isLoading,
      loadingText: "Deleting...",
      isDisabled,
    },
    `Delete`
  )

DeleteButton.displayName = "DeleteButton"
