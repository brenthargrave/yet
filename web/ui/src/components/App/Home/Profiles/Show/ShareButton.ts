import { Icon } from "@chakra-ui/react"
import { h } from "@cycle/react"
import { FC } from "react"
import { FiShare } from "react-icons/fi"
import { Button } from "~/system"

interface Props {
  onClick?: () => void
  cta?: string
  variant?: "outline" | "solid"
}

export const ShareButton: FC<Props> = ({
  variant = "solid",
  onClick,
  cta,
  ...props
}) =>
  h(
    Button,
    {
      ...props,
      leftIcon: h(Icon, { as: FiShare }),
      size: "xs",
      onClick,
      variant,
    },
    cta ?? `Share`
  )
