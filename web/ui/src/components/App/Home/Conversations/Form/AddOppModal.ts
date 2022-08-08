import { h } from "@cycle/react"
import { FC } from "react"
import { Modal, Text } from "~/system"

export interface Props {
  isOpen: boolean
  onClose?: () => void
}

export const View: FC<Props> = ({ isOpen, onClose = () => null }) =>
  h(
    Modal,
    {
      isOpen,
      onClose,
      showHeader: false,
      showCloseButton: false,
      showFooter: false,
    },
    [
      // TODO:
      h(Text, "TODO"),
    ]
  )

View.displayName = "AddOppModal"
