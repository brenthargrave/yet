import { SmallCloseIcon } from "@chakra-ui/icons"
import { h } from "@cycle/react"
import { AriaButton } from "~/system"

export interface Props {
  onCancel?: () => void
}

export const CancelButton = ({ onCancel, ...props }: Props) =>
  h(
    AriaButton,
    {
      variant: "ghost",
      leftIcon: h(SmallCloseIcon),
      size: "sm",
      onClick: onCancel,
      ...props,
    },
    "Cancel"
  )

CancelButton.displayName = "CancelButton"
