import { HStack, Icon, IconButton, Tooltip, VStack } from "@chakra-ui/react"
import { h } from "@cycle/react"
import { FC, Ref, useRef, RefObject } from "react"
import { FiHome } from "react-icons/fi"
import { TbArrowsSplit2, TbNotes } from "react-icons/tb"

const iconConversations = TbNotes
const iconOpps = TbArrowsSplit2
const iconHome = FiHome

export enum Orientation {
  horizontal = "horizontal",
  vertical = "vertical",
}

export interface Props {
  orientation: Orientation
  onClickConversations: () => void
  onClickOpps: () => void
  onClickHome: () => void
}

const onClickBlur = (
  ref: RefObject<HTMLButtonElement | undefined>,
  cb: () => void
) => {
  return (e: React.MouseEvent<HTMLButtonElement>) => {
    cb()
    ref.current?.blur()
  }
}

export const MenuView: FC<Props> = ({
  orientation,
  onClickConversations,
  onClickOpps,
  onClickHome,
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
  const buttonRefHome = useRef<HTMLButtonElement>()
  const onClickHomeButton = onClickBlur(buttonRefHome, onClickHome)

  const stack = orientation === Orientation.horizontal ? HStack : VStack
  return h(stack, { gap: 1 }, [
    h(Tooltip, { shouldWrapChildren: true, label: "Timeline" }, [
      h(IconButton, {
        icon: h(Icon, { as: iconHome }),
        size: "lg",
        variant: "outline",
        ref: buttonRefHome,
        onClick: onClickHomeButton,
      }),
    ]),
    h(Tooltip, { shouldWrapChildren: true, label: "Conversations" }, [
      h(IconButton, {
        icon: h(Icon, { as: iconConversations }),
        size: "lg",
        variant: "outline",
        ref: buttonRefConvos,
        onClick: onClickConvosButton,
      }),
    ]),
    h(Tooltip, { shouldWrapChildren: true, label: "Opportunities" }, [
      h(IconButton, {
        icon: h(Icon, { as: iconOpps }),
        size: "lg",
        variant: "outline",
        // color: "green.600",
        ref: buttonRefOpps,
        onClick: onClickOppsButton,
      }),
    ]),
  ])
}
