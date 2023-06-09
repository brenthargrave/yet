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
      sx: {
        marginLeft: "-8px",
      },
      leftIcon: h(Icon, { as: FaChevronLeft }),
      variant: "ghost",
      size: "xs",
      onClick,
    },
    cta
  )

BackButton.displayName = "BackButton"
