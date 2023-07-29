import { DeleteIcon } from "@chakra-ui/icons"
import { Button } from "@chakra-ui/react"
import { h } from "@cycle/react"
import { FC } from "react"
import { ID } from "~/graph"

interface Props {
  onClick?: (id?: ID) => void
  isLoading?: boolean
  isDisabled?: boolean
  cta?: string
}

export const DeleteButton: FC<Props> = ({
  onClick,
  isLoading,
  isDisabled,
  cta = "Delete",
}) =>
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
    cta
  )

DeleteButton.displayName = "DeleteButton"
