import { SmallAddIcon } from "@chakra-ui/icons"
import { Button } from "@chakra-ui/react"
import { h } from "@cycle/react"

export interface Props {
  onClick?: () => void
  isLoading?: boolean
  isDisabled?: boolean
}

export const CreateButton = ({ onClick, isLoading, isDisabled }: Props) =>
  h(
    Button,
    {
      variant: "outline",
      size: "xs",
      leftIcon: h(SmallAddIcon),
      onClick,
      isLoading,
      isDisabled,
    },
    `New`
  )
