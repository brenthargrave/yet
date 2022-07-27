import { Icon } from "@chakra-ui/icons"
import { h } from "@cycle/react"
import { FC } from "react"
import { FaChevronLeft } from "react-icons/fa"
import { Button } from "~/system"

interface Props {
  onClick?: () => void
  cta?: string
}

export const BackButton: FC<Props> = ({ onClick, cta }) =>
  h(
    Button,
    {
      leftIcon: h(Icon, { as: FaChevronLeft }),
      variant: "unstyled",
      size: "sm",
      onClick,
    },
    cta
  )

BackButton.displayName = "BackButton"
