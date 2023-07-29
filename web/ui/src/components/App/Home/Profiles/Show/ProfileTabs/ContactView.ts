import { h } from "@cycle/react"
import { FC } from "react"
import { Contact, Customer, Maybe, Profile } from "~/graph"
import { routes } from "~/router"
import { bold, MarkdownView } from "~/system"

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
  const { conversationCountWithSubject: count } = contact
  let md = bold(profileLink(contact, viewer))
  if (count) md += ` (${count})`
  return h(MarkdownView, { md })
}

ContactView.displayName = "ContactView"
