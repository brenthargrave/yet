import { Icon, IconButton, HStack, VStack } from "@chakra-ui/react"
import { h } from "@cycle/react"
import { FC, useRef } from "react"
import { TbArrowsSplit2, TbNotes } from "react-icons/tb"

export enum Orientation {
  horizontal = "horizontal",
  vertical = "vertical",
}

interface Props {
  orientation: Orientation
  onClickConversations: () => void
  onClickOpps: () => void
}

export const MenuView: FC<Props> = ({
  orientation,
  onClickConversations,
  onClickOpps,
}) => {
  const buttonRefConvos = useRef<HTMLButtonElement>()
  const onClickConvosButton = (e: React.MouseEvent<HTMLButtonElement>) => {
    onClickConversations()
    buttonRefConvos.current?.blur()
  }
  const buttonRefOpps = useRef<HTMLButtonElement>()
  const onClickOppsButton = (e: React.MouseEvent<HTMLButtonElement>) => {
    onClickOpps()
    buttonRefOpps.current?.blur()
  }

  const stack = orientation === Orientation.horizontal ? HStack : VStack
  return h(stack, { gap: 1 }, [
    h(IconButton, {
      icon: h(Icon, { as: TbNotes }),
      size: "lg",
      variant: "outline",
      ref: buttonRefConvos,
      onClick: onClickConvosButton,
    }),
    h(IconButton, {
      icon: h(Icon, { as: TbArrowsSplit2 }),
      size: "lg",
      variant: "outline",
      color: "green.600",
      ref: buttonRefOpps,
      onClick: onClickOppsButton,
    }),
  ])
}
