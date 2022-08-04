import { ChatIcon, CheckIcon, CopyIcon } from "@chakra-ui/icons"
import {
  Button,
  Divider,
  IconButton,
  InputRightElement,
  useClipboard,
} from "@chakra-ui/react"
import { h } from "@cycle/react"
import {
  Heading,
  Input,
  InputGroup,
  Modal,
  ModalProps,
  Stack,
  Text,
} from "~/system"
import { MarkdownView } from "./MarkdownView"

export interface Props extends ModalProps {
  shareURL?: string
  onShareURLCopied?: () => void
  onClickShareViaApp?: () => void
  heading?: string
  subheading?: string
  cta?: string
}

const size = "md"

export const ShareModal = ({
  isOpen,
  onClose,
  shareURL,
  onShareURLCopied,
  onClickShareViaApp,
  heading,
  subheading,
  cta,
}: Props) => {
  const { hasCopied, onCopy } = useClipboard(shareURL ?? "")
  const url = shareURL
  let canShare = false
  if (!!navigator && !!navigator.canShare) {
    canShare = navigator.canShare({ url, title: "Conversation" })
  }

  return h(Modal, { isOpen, onClose }, [
    h(Stack, { direction: "column", gap: 4 }, [
      cta && h(MarkdownView, { md: cta }),
      heading && h(Heading, { size: "sm" }, heading),
      subheading && h(Text, subheading),
      (heading || subheading || cta) && h(Divider),
      h(Stack, { direction: "column", gap: 1 }, [
        h(Heading, { size: "xs" }, `Copy share link to clipboard`),
        h(InputGroup, { size }, [
          h(Input, {
            value: shareURL,
            isReadOnly: true,
            size,
            // @ts-ignore
            onClick: (event) => event?.target?.select(),
            focusBorderColor: "none",
          }),
          h(InputRightElement, { size }, [
            h(IconButton, {
              icon: h(hasCopied ? CheckIcon : CopyIcon),
              onClick: () => {
                onCopy()
                if (onShareURLCopied) onShareURLCopied()
              },
              size,
            }),
          ]),
        ]),
      ]),
      canShare && h(Divider),
      canShare &&
        h(Stack, { direction: "column", gap: 1 }, [
          h(Heading, { size: "xs" }, `Or share via app`),
          h(
            Button,
            {
              leftIcon: h(ChatIcon),
              onClick: async () => {
                await navigator
                  .share({ url })
                  // eslint-disable-next-line no-console
                  .catch((error) => console.error(error))
                  .finally(() => onClickShareViaApp && onClickShareViaApp())
              },
            },
            `SMS, email, encrypted chat, etc.`
          ),
        ]),
    ]),
  ])
}

ShareModal.displayName = "ShareModal"
