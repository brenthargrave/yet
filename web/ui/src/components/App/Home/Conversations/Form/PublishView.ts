import { CopyIcon, CheckIcon } from "@chakra-ui/icons"
import {
  Divider,
  IconButton,
  InputRightElement,
  useClipboard,
} from "@chakra-ui/react"
import { h } from "@cycle/react"
import { FC } from "react"
import { Heading, Input, InputGroup, Stack, Text } from "~/system"
import { Props as ModalProps, View as Modal } from "./Modal"

export interface Props extends ModalProps {
  shareURL?: string
}

const size = "md"

export const View: FC<Props> = ({ isOpen, onClose, shareURL }) => {
  const { hasCopied, onCopy } = useClipboard(shareURL ?? "")

  return h(Modal, { isOpen, onClose }, [
    h(Stack, { direction: "column", gap: 4 }, [
      h(Heading, { size: "sm" }, `Now share your notes with X, Y & Z!`),
      h(
        Text,
        `When cosigned they become visible to your combined networks, and you'll get attribution for any mentioned opportunities, leads, etc.`
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
              onClick: onCopy,
              size,
            }),
          ]),
        ]),
      ]),
      h(Divider),
      // Share button
    ]),
  ])
}

View.displayName = "PublishView"
