import { HStack, Icon, IconButton, Tooltip, VStack } from "@chakra-ui/react"
import { h } from "@cycle/react"
import { FC, Ref, useRef, RefObject } from "react"
import { FiHome } from "react-icons/fi"
import { TbArrowsSplit2, TbNotes } from "react-icons/tb"
import { CgProfile } from "react-icons/cg"

const iconConversations = TbNotes
const iconOpps = TbArrowsSplit2
const iconHome = FiHome
const iconProfile = CgProfile

export enum Orientation {
  horizontal = "horizontal",
  vertical = "vertical",
}

export interface Props {
  orientation: Orientation
  onClickConversations: () => void
  onClickOpps: () => void
  onClickHome: () => void
  onClickProfile: () => void
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
  onClickConversations: _onClickConvos,
  onClickOpps: _onClickOpps,
  onClickHome: _onClickHome,
  onClickProfile: _onClickProfile,
}) => {
  const buttonRefConvos = useRef<HTMLButtonElement>()
  const onClickConvos = (e: React.MouseEvent<HTMLButtonElement>) => {
    _onClickConvos()
    buttonRefConvos.current?.blur()
  }
  const buttonRefOpps = useRef<HTMLButtonElement>()
  const onClickOpps = (e: React.MouseEvent<HTMLButtonElement>) => {
    _onClickOpps()
    buttonRefOpps.current?.blur()
  }
  const buttonRefHome = useRef<HTMLButtonElement>()
  const onClickHome = onClickBlur(buttonRefHome, _onClickHome)
  const buttonRefProfile = useRef<HTMLButtonElement>()
  const onClickProfile = onClickBlur(buttonRefProfile, _onClickProfile)

  const stack = orientation === Orientation.horizontal ? HStack : VStack
  return h(stack, { gap: 1 }, [
    h(Tooltip, { shouldWrapChildren: true, label: "Home" }, [
      h(IconButton, {
        icon: h(Icon, { as: iconHome }),
        size: "lg",
        variant: "outline",
        ref: buttonRefHome,
        onClick: onClickHome,
      }),
    ]),
    h(Tooltip, { shouldWrapChildren: true, label: "Conversations" }, [
      h(IconButton, {
        icon: h(Icon, { as: iconConversations }),
        size: "lg",
        variant: "outline",
        ref: buttonRefConvos,
        onClick: onClickConvos,
      }),
    ]),
    h(Tooltip, { shouldWrapChildren: true, label: "Opportunities" }, [
      h(IconButton, {
        icon: h(Icon, { as: iconOpps }),
        size: "lg",
        variant: "outline",
        // color: "green.600",
        ref: buttonRefOpps,
        onClick: onClickOpps,
      }),
    ]),
    h(Tooltip, { shouldWrapChildren: true, label: "Profile" }, [
      h(IconButton, {
        icon: h(Icon, { as: iconProfile }),
        size: "lg",
        variant: "outline",
        ref: buttonRefProfile,
        onClick: onClickProfile,
      }),
    ]),
  ])
}
