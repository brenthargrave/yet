import { LinkIcon } from "@chakra-ui/icons"
import { Icon } from "@chakra-ui/react"
import { FiShare } from "react-icons/fi"
import { h } from "@cycle/react"
import { ActionButton } from "~/system"

export interface Props {
  onClickShare?: () => void
}

export const ShareButton = ({ onClickShare }: Props) =>
  h(ActionButton, {
    cta: "Share",
    leftIcon: h(Icon, { as: FiShare }),
    onClick: onClickShare,
  })

ShareButton.displayName = "ShareButton"
