import { h } from "@cycle/react"
import { FC, ReactNode } from "react"
import { containerProps, Modal } from "~/system"

const { minHeight } = containerProps

export interface Props {
  isOpen: boolean
  onClose?: () => void
  oppsView: ReactNode
}

export const View: FC<Props> = ({ isOpen, onClose = () => null, oppsView }) => {
  return h(
    Modal,
    {
      isOpen,
      onClose,
      // showFooter: false,
      // showHeader: false,
      // showCloseButton: false,
      autoFocus: false,
      showFooter: true,
      showHeader: true,
      // headerText: "Opportunities",
      showCloseButton: true,
      minHeight,
    },
    [oppsView]
  )
}

View.displayName = "AddOppModal"
