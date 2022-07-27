import { Button } from "@chakra-ui/react"
import { h } from "@cycle/react"
import { FC, ReactNode } from "react"

export interface Props {
  cta: string
  rightIcon?: ReactNode
  onClick?: () => void
  isDisabled?: boolean
  isLoading?: boolean
}

export const ActionButton: FC<Props> = ({
  cta,
  rightIcon,
  onClick,
  isDisabled,
  isLoading,
}) =>
  h(
    Button,
    {
      rightIcon,
      onClick,
      isDisabled,
      isLoading,
    },
    cta
  )
