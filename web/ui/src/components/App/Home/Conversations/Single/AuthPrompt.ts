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
import {
  AriaButton,
  ariaLabel,
  Center,
  MarkdownView,
  maxWidth,
  Stack,
} from "~/system"

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
            h(Stack, { maxWidth, width: "100%", direction: "column", gap: 6 }, [
              h(MarkdownView, {
                md: `**${creatorName}** wants to share their notes from your conversation on **${occurredAtDesc}**.

               Please sign in to review them.`,
                ...ariaLabel(`Please sign in to review them.`),
              }),
              h(
                Stack,
                { direction: "column", alignItems: "center", width: "100%" },
                [
                  //
                  h(AriaButton, { onClick: onClickAuth }, `Sign in / Sign up`),
                ]
              ),
            ]),
          ]),
        ]),
        h(ModalFooter, { key: "footer" }, []),
      ]),
    ],
  })
}

View.displayName = "AuthPrompt"
