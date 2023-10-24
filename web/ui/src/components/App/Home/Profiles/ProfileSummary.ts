import { LinkIcon } from "@chakra-ui/icons"
import { HStack, Icon, Link, StackDivider, Text } from "@chakra-ui/react"
import { h } from "@cycle/react"
import { FC } from "react"
import { GrLocation } from "react-icons/gr"
import { Contact, formatWebsite, ProfileExtended } from "~/graph"
import { FullWidthVStack } from "~/system"
import { WorkView } from "./Show/WorkView"
import { SocialsList } from "./SocialsList"

type ProfileLike = ProfileExtended | Contact

export enum WithinView {
  Profile = "profile",
  Contact = "contact",
}

export interface Props {
  profile: ProfileLike
  within?: WithinView
}

export const ProfileSummary: FC<Props> = ({
  profile,
  within = WithinView.Profile,
}) => {
  const { role, org, location, website, socials } = profile

  return h(FullWidthVStack, { gap: 2 }, [
    //
    h(WorkView, {
      role,
      org,
      ...(within === WithinView.Contact && {
        fontSize: "sm",
      }),
    }),
    // Socials, links
    h(HStack, { divider: h(StackDivider), gap: 1, fontSize: "sm" }, [
      h(SocialsList, { socials }),
      website &&
        h(HStack, {}, [
          h(LinkIcon, { boxSize: 3 }),
          h(
            Link,
            {
              //
              // fontSize: "sm",
              href: website,
              target: "_blank",
            },
            formatWebsite(website)
          ),
        ]),
      location &&
        h(HStack, {}, [
          //
          h(Icon, { as: GrLocation }),
          h(Text, {}, location),
        ]),
    ]),
  ])
}
