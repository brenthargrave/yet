import { LinkIcon } from "@chakra-ui/icons"
import { Button } from "@chakra-ui/react"
import { h } from "@cycle/react"
import { ActionButton } from "~/system"

export interface Props {
  onClickShare?: () => void
}

export const ShareButton = ({ onClickShare }: Props) =>
  h(ActionButton, {
    cta: "Share",
    rightIcon: h(LinkIcon),
    onClick: onClickShare,
  })

ShareButton.displayName = "ShareButton"
