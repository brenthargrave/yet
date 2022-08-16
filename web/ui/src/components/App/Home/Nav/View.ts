import { Icon, IconButton } from "@chakra-ui/react"
import { h } from "@cycle/react"
import { FC } from "react"
import { TbArrowsSplit2 } from "react-icons/tb"

interface Props {}

export const View: FC<Props> = () =>
  // h(Button, {
  //   variant: "outline",
  //   leftIcon: h(Icon, { as: TbArrowsSplit2 }),
  // })
  h(IconButton, {
    icon: h(Icon, { as: TbArrowsSplit2 }),
    size: "lg",
    variant: "outline",
    // variant: "ghost",
  })
