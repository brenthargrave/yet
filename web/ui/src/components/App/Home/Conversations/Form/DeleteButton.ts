import { DeleteIcon } from "@chakra-ui/icons"
import { Button, IconButton } from "@chakra-ui/react"
import { h } from "@cycle/react"

export interface Props {
  onClick?: () => void
  isLoading?: boolean
  isDisabled?: boolean
}

export const DeleteButton = ({ onClick, isLoading, isDisabled }: Props) =>
  // h(IconButton, {
  //   icon: h(DeleteIcon),
  //   size: "xs",
  //   variant: "ghost",
  //   onClick,
  //   isLoading,
  //   loadingText: "Deleting...",
  //   isDisabled,
  // })

  h(
    Button,
    {
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
