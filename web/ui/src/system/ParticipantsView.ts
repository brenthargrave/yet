import { h } from "@cycle/react"
import { FC } from "react"
import { isEmpty, isNotEmpty, map, prop } from "~/fp"
import {
  Contact,
  ConversationStatus,
  Customer,
  Invitee,
  isStatusClosed,
  Maybe,
} from "~/graph"
import { toSentence } from "~/i18n"
import { MarkdownView } from "~/system"

type Participant = Omit<Invitee, "__typename" | "isContact">

const bold = (inner: string) => `**${inner}**`

const personalizedName = (me: Maybe<Customer>, subject: Contact | Invitee) =>
  !!me && me.id === subject.id ? "You" : subject.name

export interface Props {
  viewer: Maybe<Customer>
  status: ConversationStatus
  creator: Contact
  invitees: Invitee[]
  signers: Contact[]
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
