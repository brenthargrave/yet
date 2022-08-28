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
  showNote?: boolean
  showOpps?: boolean
}

export const ConversationView: FC<Props> = ({
  viewer,
  conversation,
  maxLines,
  isObscured,
  showStatus = true,
  showNote = true,
  showOpps = false,
}) => {
  const { creator, signatures, invitees, note, occurredAt, status, opps } =
    conversation
  const signers = map((sig) => sig.signer, signatures)
  return h(Stack, { direction: "column" }, [
    h(Stack, { direction: "row", alignItems: "start" }, [
      h(Stack, { direction: "column", alignItems: "start" }, [
        h(ParticipantsView, {
          viewer,
          status,
          creator,
          invitees,
          signers,
        }),
        showOpps && !isEmpty(opps) && h(MentionsView, { opps }),
      ]),
      h(Spacer),
      h(
        Stack,
        {
          direction: "column",
          alignItems: "end",
          minWidth: "99px", // NOTE: fixed to prevent date wrap
        },
        [
          h(Text, { fontSize: "sm" }, localizeDate(new Date("01-28-2022"))),
          showStatus && h(Status, { status }),
        ]
      ),
    ]),
    showNote && h(NoteView, { note, maxLines, isObscured }),
  ])
}

ConversationView.displayName = "ConversationView"
