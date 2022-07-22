import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
} from "@chakra-ui/react"
import { h } from "@cycle/react"
import { FC } from "react"
import { Center, MarkdownView, maxWidth, Stack } from "~/system"

export interface Props {
  isOpen: boolean
  onClickAuth?: () => void
  creatorName?: string
  occurredAtDesc?: string
}

export const View: FC<Props> = ({
  isOpen = false,
  onClickAuth,
  creatorName = "???",
  occurredAtDesc = "???",
}) => {
  const onClose = () => null
  return h(Modal, {
    // isCentered: true,
    autoFocus: true,
    closeOnEsc: true,
    closeOnOverlayClick: true,
    isOpen,
    onClose,
    children: [
      h(ModalOverlay, { key: "overlay" }),
      h(ModalContent, { key: "content", margin: 2 }, [
        h(ModalHeader, { key: "header" }, ""),
        h(ModalBody, { key: "body" }, [
          h(Center, {}, [
            h(Stack, { maxWidth }, [
              h(MarkdownView, {
                md: `**${creatorName}** wants to share their notes from your conversation on **${occurredAtDesc}**.

            Sign in below to review them`,
              }),
            ]),
          ]),
        ]),
        h(ModalFooter, { key: "footer" }, [
          h(
            Stack,
            { direction: "column", alignItems: "center", width: "100%" },
            [
              //
              h(Button, { onClick: onClickAuth }, `Sign in / Sign up`),
            ]
          ),
        ]),
      ]),
    ],
  })
}

View.displayName = "AuthPrompt"
