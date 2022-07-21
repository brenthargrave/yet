import {
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
} from "@chakra-ui/react"
import { h } from "@cycle/react"
import { FC } from "react"
import { Button, MarkdownView, Stack } from "~/system"

export interface Props {
  isOpen: boolean
  onClickAuth?: () => void
  creatorName?: string
  occurredAtDesc?: string
}

export const View: FC<Props> = ({
  //
  isOpen = false,
  onClickAuth,
  creatorName = "???",
  occurredAtDesc = "???",
}) => {
  return h(Drawer, {
    isOpen,
    placement: "top",
    onClose: () => {
      /* NOTE: no-cop */
    },
    children: [
      h(DrawerOverlay),
      h(DrawerContent, [
        h(DrawerHeader, ``),
        h(DrawerBody, [
          h(MarkdownView, {
            md: `**${creatorName}** wants to share their notes from your conversation on **${occurredAtDesc}**

            Sign in below to review them`,
          }),
        ]),
        h(DrawerFooter, [
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
