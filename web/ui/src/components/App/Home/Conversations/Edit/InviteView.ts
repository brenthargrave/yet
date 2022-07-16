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

export const View: FC<Props> = ({ isOpen = false, onClose }) =>
  h(Modal, {
    isCentered: true,
    autoFocus: true,
    closeOnEsc: true,
    closeOnOverlayClick: true,
    // finalFocusRef: TODO:
    isOpen,
    onClose,
    children: [
      h(ModalOverlay),
      h(ModalContent, {}, [
        h(ModalHeader, {}, ""),
        h(ModalCloseButton),
        h(ModalBody, [`Hello, world!`]),
        h(ModalFooter, [
          //
          h(Button, { onClick: onClose }, `TODO`),
        ]),
      ]),
    ],
  })

View.displayName = "InviteView"
