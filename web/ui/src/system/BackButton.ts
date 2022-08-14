import { Icon } from "@chakra-ui/icons"
import { h } from "@cycle/react"
import { FC } from "react"
import { FaChevronLeft } from "react-icons/fa"
import { Button } from "~/system"

interface Props {
  onClick?: () => void
  cta?: string
}

export const BackButton: FC<Props> = ({ onClick, cta = "Back" }) =>
  h(
    Button,
    {
      leftIcon: h(Icon, { as: FaChevronLeft }),
      // variant: "unstyled",
      // paddingLeft: 0,
      variant: "ghost",
      size: "sm",
      onClick,
    },
    cta
  )

BackButton.displayName = "BackButton"
