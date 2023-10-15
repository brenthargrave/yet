import { HStack, StackDivider } from "@chakra-ui/react"
import { h } from "@cycle/react"
import { FC } from "react"
import { SocialButton } from "./SocialButton"

export interface Props {
  socials: string[]
}

export const SocialsList: FC<Props> = ({ socials }) =>
  socials.length === 0
    ? null
    : h(HStack, { divider: h(StackDivider) }, [
        ...socials.map((socialURL) =>
          h(SocialButton, { urlString: socialURL })
        ),
      ])
