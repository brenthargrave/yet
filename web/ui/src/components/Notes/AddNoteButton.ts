import { AddIcon } from "@chakra-ui/icons"
import { Icon } from "@chakra-ui/react"
import { h } from "@cycle/react"
import { ActionButton } from "~/system"

export interface Props {
  onClickAdd?: () => void
  isDisabled?: boolean
  isLoading?: boolean
}

export const AddNoteButton = ({
  onClickAdd,
  isDisabled = true,
  isLoading = false,
}: Props) =>
  h(ActionButton, {
    cta: "Add note",
    leftIcon: h(Icon, { as: AddIcon }),
    onClick: onClickAdd,
    isDisabled,
    isLoading,
  })

AddNoteButton.displayName = "AddNoteButton"
