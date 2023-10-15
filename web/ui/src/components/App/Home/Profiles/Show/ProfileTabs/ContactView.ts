import {
  Divider,
  ListItem,
  Stack,
  StackDivider,
  StackProps,
} from "@chakra-ui/react"
import { h } from "@cycle/react"
import { span } from "@cycle/react-dom"
import { FC } from "react"
import { Contact, Customer, Maybe, Profile } from "~/graph"
import { routes } from "~/router"
import { bold, MarkdownView } from "~/system"
import { WithinView, ProfileSummary } from "../../ProfileSummary"
import { WorkView } from "../WorkView"

export interface Props {
  viewer: Customer
  contact: Contact
}

// TODO: refactor against ParticipantsView
const link = (text: string, href: string) =>
  `<a style="text-decoration: none;" href=${href}>${text}</a>`

const profileLink = (profile: Contact | Profile, viewer: Maybe<Customer>) => {
  const route =
    viewer?.id === profile.id
      ? routes.me()
      : routes.profile({ pid: profile.id })
  return link(profile.name, route.href)
}

export const ContactView: FC<Props> = ({ viewer, contact }) => {
  const { conversationCountWithSubject: count, socials, role, org } = contact
  let md = bold(profileLink(contact, viewer))
  if (count) md += ` (${count})`
  const stackProps: StackProps = {
    direction: "row",
    width: "100%",
    justify: "flex-start",
    align: "end",
  }
  return h(ListItem, {}, [
    h(
      Stack,
      {
        //
        width: "100%",
        direction: "column",
        gap: 1,
        // divider: h(StackDivider),
      },
      [
        //
        h(
          Stack,
          {
            //
            ...stackProps,
          },
          [
            //
            h(MarkdownView, { md, fontSize: 16 }),
            role &&
              org &&
              span({ dangerouslySetInnerHTML: { __html: "&#8226" } }),
            role &&
              org &&
              h(WorkView, { role, org, fontSize: 14, omitIcon: true }),
          ]
        ),
        h(ProfileSummary, { profile: contact, within: WithinView.Contact }),
      ]
    ),
  ])
}

ContactView.displayName = "ContactView"
