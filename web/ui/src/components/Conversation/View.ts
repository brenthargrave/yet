import { Spacer } from "@chakra-ui/react"
import { h } from "@cycle/react"
import { FC } from "react"
import { NoteView, Props as NoteViewProps } from "~/components/Note"
import { isEmpty, map } from "~/fp"
import { Conversation, Customer, Maybe } from "~/graph"
import { localizeDate } from "~/i18n"
import { MarkdownView, Stack, Status, Text } from "~/system"
import { ParticipantsView } from "~/system/ParticipantsView"
import { MentionsView } from "./MentionsView"

export interface Props extends Omit<NoteViewProps, "note"> {
  viewer: Maybe<Customer>
  conversation: Conversation
  showStatus?: boolean
  showOpps?: boolean
}

export const ConversationView: FC<Props> = ({
  viewer,
  conversation,
  maxLines,
  isObscured,
  showStatus = true,
  showOpps = false,
}) => {
  const { creator, signatures, invitees, note, occurredAt, status, opps } =
    conversation
  const signers = map((sig) => sig.signer, signatures)
  return h(Stack, { direction: "column" }, [
    h(Stack, { direction: "row", alignItems: "center" }, [
      h(ParticipantsView, {
        viewer,
        status,
        creator,
        invitees,
        signers,
      }),
      h(Spacer),
      h(Stack, { direction: "column", alignItems: "end" }, [
        h(Text, { fontSize: "sm" }, localizeDate(occurredAt)),
        showStatus && h(Status, { status }),
      ]),
    ]),
    showOpps && !isEmpty(opps) && h(MentionsView, { opps }),
    h(NoteView, { note, maxLines, isObscured }),
  ])
}

ConversationView.displayName = "ConversationView"
