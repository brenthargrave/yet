import { Button, Heading, Text } from "@chakra-ui/react"
import { h } from "@cycle/react"
import { FC } from "react"
import { t } from "~/i18n"
import { EmptyViewBase } from "~/system"

export type OnClickNew = () => void

export interface Props {
  onClickNew?: OnClickNew
}

export const EmptyView: FC<Props> = ({ onClickNew, ...props }) =>
  h(EmptyViewBase, { ...props }, [
    h(Heading, { size: "md" }, `No network activity just yet.`),
    h(
      Text,
      { align: "center" },
      `To get started, share notes of your conversations with others to grow your network.`
    ),
    h(Button, { onClick: onClickNew }, t(`note.empty.buttonCopy`)),
  ])

EmptyView.displayName = "EmptyView"
