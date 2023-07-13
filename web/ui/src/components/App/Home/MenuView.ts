import { HStack, Icon, IconButton, Tooltip, VStack } from "@chakra-ui/react"
import { h } from "@cycle/react"
import { FC, Ref, useRef, RefObject } from "react"
import { FiHome } from "react-icons/fi"
import { TbArrowsSplit2, TbNotes } from "react-icons/tb"
import { CgProfile } from "react-icons/cg"
import { AddIcon } from "@chakra-ui/icons"
import { ariaLabel, Button, Divider } from "~/system"
import { oppsEnabled } from "~/graph"
import { MenuButton } from "./MenuButton"

const iconConversations = TbNotes
const iconOpps = TbArrowsSplit2
const iconHome = FiHome
const iconProfile = CgProfile
const iconAdd = AddIcon

export enum Orientation {
  horizontal = "horizontal",
  vertical = "vertical",
}

export interface Props {
  orientation: Orientation
  showHomeOnly: boolean
  onClickConversations: () => void
  onClickOpps: () => void
  onClickHome: () => void
  onClickProfile: () => void
  onClickNew: () => void
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
  showHomeOnly = true,
  onClickConversations: _onClickConvos,
  onClickOpps: _onClickOpps,
  onClickHome: _onClickHome,
  onClickProfile: _onClickProfile,
  onClickNew: _onClickNew,
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
  const buttonRefNew = useRef<HTMLButtonElement>()
  const onClickNew = onClickBlur(buttonRefNew, _onClickNew)

  const stack = orientation === Orientation.horizontal ? HStack : VStack
  const iconOnly = true
  return h(stack, { gap: 1 }, [
    h(MenuButton, {
      isVisible: true,
      label: "Home",
      onClick: onClickHome,
      ref: buttonRefHome,
      icon: iconHome,
      iconOnly,
    }),
    h(MenuButton, {
      isVisible: !showHomeOnly,
      label: "Conversations",
      onClick: onClickConvos,
      ref: buttonRefConvos,
      icon: iconConversations,
      iconOnly,
    }),
    oppsEnabled &&
      h(MenuButton, {
        isVisible: !showHomeOnly,
        label: "Opportunities",
        onClick: onClickOpps,
        ref: buttonRefOpps,
        icon: iconOpps,
        iconOnly,
      }),
    h(MenuButton, {
      isVisible: !showHomeOnly,
      label: "Profile",
      onClick: onClickProfile,
      ref: buttonRefProfile,
      icon: iconProfile,
      iconOnly,
    }),
    h(Divider),
    h(MenuButton, {
      label: "New Note",
      icon: iconAdd,
      iconOnly,
      variant: "outline",
      isVisible: !showHomeOnly,
      onClick: onClickNew,
      ref: buttonRefProfile,
    }),
  ])
}
