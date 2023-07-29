import { h } from "@cycle/react"
import { FC } from "react"
import { isNotEmpty } from "~/fp"
import {
  ConversationStatus,
  Customer,
  Invitee,
  isStatusClosed,
  Maybe,
  Profile,
} from "~/graph"
import { toSentence } from "~/i18n"
import { routes } from "~/router"
import { bold, MarkdownView } from "~/system"

const personalizedName = (me: Maybe<Customer>, subject: Profile | Invitee) =>
  !!me && me.id === subject.id ? "You" : subject.name

export interface Props {
  viewer: Maybe<Customer>
  status: ConversationStatus
  creator: Profile
  invitees: Invitee[]
  participants: Profile[]
}

const link = (text: string, href: string) =>
  `<a style="text-decoration: underline;" href=${href}>${text}</a>`

const profileLink = (profile: Profile, viewer: Maybe<Customer>) => {
  const route =
    viewer?.id === profile.id
      ? routes.me()
      : routes.profile({ pid: profile.id })
  return link(profile.name, route.href)
}

export const ParticipantsView: FC<Props> = ({
  viewer,
  status,
  creator,
  invitees,
  participants,
}) => {
  let md = bold(profileLink(creator, viewer))
  const others = isStatusClosed(status)
    ? participants.map((participant) => bold(profileLink(participant, viewer)))
    : invitees.map((invitee) => bold(invitee.name))
  if (isNotEmpty(others)) {
    md += ` with ${toSentence(others)}`
  }
  return h(MarkdownView, { md })
}

ParticipantsView.displayName = "ParticipantsView"
