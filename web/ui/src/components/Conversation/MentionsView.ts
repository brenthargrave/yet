import { h } from "@cycle/react"
import { FC } from "react"
import { isEmpty, isNotEmpty, map, prop, pluck } from "~/fp"
import {
  Contact,
  ConversationStatus,
  Customer,
  Invitee,
  isStatusClosed,
  Maybe,
  Mention,
  Opp,
  oppUrl,
} from "~/graph"
import { toSentence } from "~/i18n"
import { MarkdownView, bold } from "~/system"

const personalizedName = (me: Maybe<Customer>, subject: Contact | Invitee) =>
  !!me && me.id === subject.id ? "You" : subject.name

const oppLinkText = ({ org, role }: Opp) => `${role} @ ${org}`

const oppLink = (opp: Opp) => `*[${oppLinkText(opp)}](${oppUrl(opp)})*`

const oppsText = (opps: Opp[]) => toSentence(opps.map(oppLink))

export interface Props {
  // viewer: Maybe<Customer>
  mentions: Mention[]
}

export const MentionsView: FC<Props> = ({
  // viewer,
  // status,
  // creator,
  // invitees,
  mentions,
}) => {
  const opps = mentions.map((m) => m.opp)
  const md = `Discussed opps: ${oppsText(opps)}`
  return h(MarkdownView, { md })
}

MentionsView.displayName = "MentionsView"
