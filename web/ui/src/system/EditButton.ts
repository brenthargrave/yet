import { EditIcon } from "@chakra-ui/icons"
import { Icon } from "@chakra-ui/react"
import { h } from "@cycle/react"
import { FC } from "react"
import { Button } from "~/system"

interface Props {
  onClick?: () => void
  cta?: string
}

export const EditButton: FC<Props> = ({ onClick, cta, ...props }) =>
  h(
    Button,
    {
      ...props,
      leftIcon: h(Icon, { as: EditIcon }),
      size: "xs",
      onClick,
    },
    cta ?? `Edit`
  )
