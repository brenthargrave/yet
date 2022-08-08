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
import { ModalProps, Text } from "~/system"

export interface Props {
  isOpen: boolean
  onClose?: () => void
}

export const View = ({ isOpen, onClose = () => null }: Props) => {
  return h(Modal, {
    // isCentered: true,
    autoFocus: true,
    closeOnEsc: true,
    closeOnOverlayClick: true,
    isOpen,
    onClose,
    children: [
      h(ModalOverlay, { key: "overlay" }),
      h(ModalContent, { key: "content" }, [
        // h(ModalHeader, { key: "header" }, ""),
        // h(ModalCloseButton, { key: "closeButton" }),
        h(ModalBody, { key: "body" }, [
          // TODO
          h(Text, "TODO"),
        ]),
        // h(ModalFooter, { key: "footer" }, [
        // ?
        // ]),
      ]),
    ],
  })
}

View.displayName = "AddOppModal"
