import { forwardRef, Icon, IconButton, Tooltip } from "@chakra-ui/react"
import { h } from "@cycle/react"
import { IconType } from "react-icons"
import { ariaLabel, Button } from "~/system"

export interface Props {
  label: string
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void
  isVisible: boolean
  icon: IconType
  iconOnly: boolean
}

export const MenuButton = forwardRef(
  ({ label, onClick, isVisible, icon, iconOnly = true, ...rest }: Props, ref) =>
    iconOnly
      ? h(Tooltip, { shouldWrapChildren: true, label }, [
          h(IconButton, {
            icon: h(Icon, { as: icon }),
            variant: "outline",
            ref,
            onClick,
            ...ariaLabel(label),
          }),
        ])
      : h(
          Button,
          {
            leftIcon: h(Icon, { as: icon }),
            // size: "lg",
            variant: "outline",
            ref,
            onClick,
            ...ariaLabel(label),
          },
          label
        )
)
