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
  autoFocus?: boolean
  showHeader?: boolean
  headerText?: string
  showCloseButton?: boolean
  showFooter?: boolean
  minHeight?: string
}

export const View: FC<Props> = ({
  isOpen,
  onClose,
  children,
  autoFocus = true,
  showHeader = true,
  headerText = "",
  showCloseButton = true,
  showFooter = false,
  minHeight,
}) =>
  h(Modal, {
    autoFocus,
    closeOnEsc: true,
    closeOnOverlayClick: true,
    isOpen,
    onClose,
    children: [
      h(ModalOverlay, { key: "overlay" }),
      h(ModalContent, { key: "content" }, [
        showHeader && h(ModalHeader, { key: "header" }, headerText),
        showCloseButton && h(ModalCloseButton, { key: "closeButton" }),
        h(ModalBody, { minHeight, key: "body" }, [children]),
        showFooter &&
          h(ModalFooter, { key: "footer" }, [
            // ?
          ]),
      ]),
    ],
  })

View.displayName = "Modal"
