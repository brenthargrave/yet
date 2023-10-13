import { Button, ButtonProps, Icon } from "@chakra-ui/react"
import { h } from "@cycle/react"
import { FC } from "react"
import { FiVolume2 as Follow, FiVolumeX as Unfollow } from "react-icons/fi"

export type OnClickMute = (newValue: boolean) => void

interface Props extends ButtonProps {
  onClickMute?: OnClickMute
  isMuted?: boolean
}

export const View: FC<Props> = ({
  onClickMute,
  isMuted = false,
  isLoading = false,
  ...otherProps
}) => {
  const onClick = () => onClickMute && onClickMute(!isMuted)
  const cta = isMuted ? "Unmute" : "Mute"
  const icon = isMuted ? Follow : Unfollow
  const props: ButtonProps = {
    isLoading,
    leftIcon: h(Icon, { as: icon }),
    size: "xs",
    onClick,
    variant: "outline",
    ...otherProps,
  }
  return h(Button, props, cta)
}
