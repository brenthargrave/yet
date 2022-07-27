import { ChevronLeftIcon } from "@chakra-ui/icons"
import { h } from "@cycle/react"
import { FC } from "react"
import { Button } from "~/system"

interface Props {
  onClick?: () => void
  cta?: string
}

export const BackButton: FC<Props> = ({ onClick, cta }) =>
  h(
    Button,
    {
      leftIcon: h(ChevronLeftIcon),
      variant: "unstyled",
      size: "sm",
      onClick,
    },
    cta
  )

BackButton.displayName = "BackButton"
