import { HStack, Icon, StackProps } from "@chakra-ui/react"
import { h } from "@cycle/react"
import { FC } from "react"
import { HiOutlineOfficeBuilding } from "react-icons/hi"
import { Profile } from "~/graph"
import { MarkdownView } from "~/system"

export interface Props
  extends Pick<Profile, "role" | "org">,
    Pick<StackProps, "fontSize"> {
  omitIcon?: boolean
}

export const WorkView: FC<Props> = ({
  role,
  org,
  omitIcon = false,
  ...props
}) =>
  role && org
    ? h(HStack, { ...props }, [
        !omitIcon && h(Icon, { as: HiOutlineOfficeBuilding }),
        h(MarkdownView, { md: `**${role}** at **${org}**` }),
      ])
    : null
