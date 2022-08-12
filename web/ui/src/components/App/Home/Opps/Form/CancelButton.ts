import { ChevronLeftIcon } from "@chakra-ui/icons"
import { h } from "@cycle/react"
import { Button } from "~/system"

export interface Props {
  onCancel?: () => void
}

export const CancelButton = ({ onCancel, ...props }: Props) =>
  h(
    Button,
    {
      variant: "ghost",
      leftIcon: h(ChevronLeftIcon),
      size: "sm",
      onClick: onCancel,
      ...props,
    },
    "Cancel"
  )

CancelButton.displayName = "CancelButton"
