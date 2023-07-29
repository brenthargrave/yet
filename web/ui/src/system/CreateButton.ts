import { SmallAddIcon } from "@chakra-ui/icons"
import { h } from "@cycle/react"
import { AriaButton } from "."

export interface Props {
  onClick?: () => void
  isLoading?: boolean
  isDisabled?: boolean
  size?: string
  variant?: string
  cta?: string
}

export const CreateButton = ({
  onClick,
  isLoading,
  isDisabled,
  size = "xs",
  variant = "solid",
  cta = `New`,
}: Props) =>
  h(
    AriaButton,
    {
      variant,
      size,
      leftIcon: h(SmallAddIcon),
      onClick,
      isLoading,
      isDisabled,
    },
    cta
  )
