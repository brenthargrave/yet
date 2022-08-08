import {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
} from "@chakra-ui/react"
import { h } from "@cycle/react"
import { FC } from "react"

export interface Props {
  isOpen: boolean
  onClose: () => void
  showHeader?: boolean
  headerText?: string
  showCloseButton?: boolean
  showFooter?: boolean
}

export const View: FC<Props> = ({
  isOpen,
  onClose,
  children,
  showHeader = true,
  headerText = "",
  showCloseButton = true,
  showFooter = false,
}) =>
  h(Modal, {
    // isCentered: true,
    autoFocus: true,
    closeOnEsc: true,
    closeOnOverlayClick: true,
    isOpen,
    onClose,
    children: [
      h(ModalOverlay, { key: "overlay" }),
      h(ModalContent, { key: "content" }, [
        showHeader && h(ModalHeader, { key: "header" }, headerText),
        showCloseButton && h(ModalCloseButton, { key: "closeButton" }),
        h(ModalBody, { key: "body" }, [children]),
        showFooter &&
          h(ModalFooter, { key: "footer" }, [
            // ?
          ]),
      ]),
    ],
  })

View.displayName = "Modal"
