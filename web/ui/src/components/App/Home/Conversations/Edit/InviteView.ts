import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
} from "@chakra-ui/react"
import { h } from "@cycle/react"
import { FC } from "react"

export interface Props {
  isOpen: boolean
  onClose: () => void
}

export const View: FC<Props> = ({ isOpen, onClose }) =>
  h(Modal, {
    isCentered: true,
    autoFocus: true,
    closeOnEsc: true,
    closeOnOverlayClick: true,
    isOpen,
    onClose,
    children: [
      h(ModalOverlay, { key: "overlay" }),
      h(ModalContent, { key: "content" }, [
        h(ModalHeader, { key: "header" }, ""),
        h(ModalCloseButton, { key: "closeButton" }),
        h(ModalBody, { key: "body" }, [`Hello, world!`]),
        h(ModalFooter, { key: "footer" }, [
          h(Button, { onClick: onClose }, `TODO`),
        ]),
      ]),
    ],
  })

View.displayName = "InviteView"
