import { CopyIcon, CheckIcon, ChatIcon } from "@chakra-ui/icons"
import {
  Button,
  Divider,
  IconButton,
  InputRightElement,
  useClipboard,
} from "@chakra-ui/react"
import { h } from "@cycle/react"
import { FC } from "react"
import { Heading, Input, InputGroup, Stack, Text } from "~/system"
import { Props as ModalProps, View as Modal } from "./Modal"
import { toSentence } from "~/i18n"

export interface Props extends ModalProps {
  participantNames?: string[]
  shareURL?: string
  onShareURLCopied?: () => void
  onClickShare: () => void
}

const size = "md"

export const PublishView: FC<Props> = ({
  participantNames = [],
  isOpen,
  onClose,
  shareURL,
  onShareURLCopied,
  onClickShare,
}) => {
  const { hasCopied, onCopy } = useClipboard(shareURL ?? "")

  const url = shareURL
  let canShare = false
  if (!!navigator && !!navigator.canShare) {
    canShare = navigator.canShare({ url, title: "Conversation" })
  }

  return h(Modal, { isOpen, onClose }, [
    h(Stack, { direction: "column", gap: 4 }, [
      h(
        Heading,
        { size: "sm" },
        `Now share your notes with ${toSentence(participantNames)}`
      ),
      h(
        Text,
        `Once cosigned they become visible to your combined networks, and you'll get attribution for any mentioned opportunities, leads, etc.`
      ),
      h(Divider),
      h(Stack, { direction: "column" }, [
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
                if (onShareURLCopied) {
                  onShareURLCopied()
                }
              },
              size,
            }),
          ]),
        ]),
      ]),
      canShare && h(Divider),
      canShare &&
        h(Stack, { direction: "column" }, [
          h(Heading, { size: "xs" }, `Or share via app`),
          h(
            Button,
            {
              leftIcon: h(ChatIcon),
              onClick: async () => {
                await navigator
                  .share({ url })
                  // eslint-disable-next-line no-alert
                  .catch((error) => alert(error))
                  .finally(() => onClickShare())
              },
            },
            `SMS, email, encrypted chat, etc.`
          ),
        ]),
    ]),
  ])
}

PublishView.displayName = "PublishView"
