import { LinkIcon } from "@chakra-ui/icons"
import { Button } from "@chakra-ui/react"
import { h } from "@cycle/react"

export interface Props {
  onClick?: () => void
  isDisabled?: boolean
}

export const ShareButton = ({ onClick, isDisabled }: Props) =>
  h(
    Button,
    {
      rightIcon: h(LinkIcon),
      onClick,
      isDisabled,
    },
    `Share`
  )

ShareButton.displayName = "ShareButton"
