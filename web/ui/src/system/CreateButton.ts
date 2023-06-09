import { SmallAddIcon } from "@chakra-ui/icons"
import { Button } from "@chakra-ui/react"
import { h } from "@cycle/react"
import { AriaButton } from "."

export interface Props {
  onClick?: () => void
  isLoading?: boolean
  isDisabled?: boolean
  cta?: string
}

export const CreateButton = ({
  onClick,
  isLoading,
  isDisabled,
  cta = `New conversation`,
}: Props) =>
  h(
    AriaButton,
    {
      // variant: "outline",
      size: "xs",
      leftIcon: h(SmallAddIcon),
      onClick,
      isLoading,
      isDisabled,
    },
    cta
  )
