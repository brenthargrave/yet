import { h } from "@cycle/react"
import { FC, ReactNode } from "react"
import {
  Modal,
  Text,
  Stack,
  Header,
  BackButton,
  modalStyleProps,
} from "~/system"

const { minHeight } = modalStyleProps

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
      // isOpen: true,
      onClose,
      // showFooter: false,
      // showHeader: false,
      // showCloseButton: false,
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
