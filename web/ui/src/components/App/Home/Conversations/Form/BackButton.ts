import { ChevronLeftIcon } from "@chakra-ui/icons"
import { IconButton } from "@chakra-ui/react"
import { h } from "@cycle/react"
import { FC } from "react"

interface Props {
  onClick?: () => void
}

export const BackButton: FC<Props> = ({ onClick }) =>
  h(IconButton, {
    icon: h(ChevronLeftIcon),
    variant: "unstyled",
    onClick,
    size: "sm",
  })
