import { IconButton, IconButtonProps } from "@chakra-ui/react"
import { h } from "@cycle/react"
import { FC } from "react"
import { iconForSocial } from "~/graph"

export interface Props {
  urlString: string
}

export const SocialButton: FC<Props> = ({ urlString }) => {
  const props = {
    icon: h(iconForSocial(urlString)),
    size: "xs",
    // colorScheme: social.toLowerCase(),
    variant: "outline",
    borderColor: "gray.200",
    onClick: () => {
      // if (onClickSocial) onClickSocial(social)
      window.open(urlString, "_blank")
    },
  }

  return h(IconButton, {
    ...props,
  })
}
