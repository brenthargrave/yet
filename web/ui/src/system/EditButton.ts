import { EditIcon } from "@chakra-ui/icons"
import { Icon } from "@chakra-ui/react"
import { h } from "@cycle/react"
import { FC } from "react"
import { Button } from "~/system"

interface Props {
  onClick?: () => void
}

export const EditButton: FC<Props> = ({ onClick }) =>
  h(
    Button,
    {
      leftIcon: h(Icon, { as: EditIcon }),
      size: "xs",
      onClick,
    },
    `Edit`
  )
