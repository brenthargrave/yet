import { h } from "@cycle/react"
import { FC } from "react"
import { isEmpty, isNotEmpty, map, prop } from "~/fp"
import {
  ConversationStatus,
  Customer,
  Invitee,
  isStatusClosed,
  Maybe,
  Profile,
} from "~/graph"
import { toSentence } from "~/i18n"
import { MarkdownView, bold } from "~/system"

type Participant = Omit<Invitee, "__typename" | "isContact">

const personalizedName = (me: Maybe<Customer>, subject: Profile | Invitee) =>
  !!me && me.id === subject.id ? "You" : subject.name

export interface Props {
  viewer: Maybe<Customer>
  status: ConversationStatus
  creator: Profile
  invitees: Invitee[]
  signers: Profile[]
}

export const ParticipantsView: FC<Props> = ({
  viewer,
  status,
  creator,
  invitees,
  signers,
}) => {
  const creatorName = creator.name
  const others: Participant[] = isStatusClosed(status) ? signers : invitees
  let md = bold(creatorName)
  if (isNotEmpty(others)) {
    const othersNames = map(prop("name"), others)
    md += ` with ${toSentence(map(bold, othersNames))}`
  }
  // md: `${bold(creatorName)} with ${toSentence(map(bold, othersNames))}`,
  return h(MarkdownView, { md })
}

ParticipantsView.displayName = "ParticipantsView"
