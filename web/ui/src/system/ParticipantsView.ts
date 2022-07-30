import { h } from "@cycle/react"
import { FC } from "react"
import { map, prop } from "~/fp"
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

type Participant = Omit<Invitee, "__typename">

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
  const creatorName = creator.name // personalizedName(viewer, creator)
  const others: Participant[] = isStatusClosed(status) ? signers : invitees
  // const othersNames = map((p) => personalizedName(viewer, p), others)
  const othersNames = map(prop("name"), others)
  return h(MarkdownView, {
    md: `${bold(creatorName)} with ${toSentence(map(bold, othersNames))}`,
  })
}

ParticipantsView.displayName = "ParticipantsView"
