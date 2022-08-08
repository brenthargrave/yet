import { h } from "@cycle/react"
import { FC } from "react"
import { Modal, Text, Stack, Header, BackButton } from "~/system"

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
      // showFooter: false,
      // showHeader: false,
      // showCloseButton: false,
      showFooter: true,
      showHeader: true,
      // headerText: "Opportunities",
      showCloseButton: true,
    },
    [
      h(
        Stack,
        {
          direction: "column",
          align: "start",
          justifyContent: "flex-start",
          // force minHeight for a list view
          minHeight: "60vh",
        },
        [
          // TODO
          h(Text, "TODO"),
        ]
      ),
    ]
  )

View.displayName = "AddOppModal"
