import { Spacer } from "@chakra-ui/react"
import { h } from "@cycle/react"
import { FC } from "react"
import { NoteView, Props as NoteViewProps } from "~/components/Note"
import { isEmpty, map } from "~/fp"
import { ariaLabelValue, Conversation, Customer, Maybe } from "~/graph"
import { localizeDate } from "~/i18n"
import { ariaLabel, Stack, Status, Text } from "~/system"
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
  const { creator, signatures, invitees, note, occurredAt, status, opps, id } =
    conversation
  const signers = map((sig) => sig.signer, signatures)
  return h(
    Stack,
    { direction: "column", ...ariaLabel(ariaLabelValue(conversation)) },
    [
      h(Stack, { direction: "row", alignItems: "end" }, [
        h(Stack, { direction: "column", alignItems: "start" }, [
          h(ParticipantsView, {
            viewer,
            status,
            creator,
            invitees,
            signers,
          }),
          h(Text, { fontSize: "sm" }, localizeDate(occurredAt)),
        ]),
        h(Spacer),
        h(
          Stack,
          {
            direction: "row",
            justifyContent: "flex-end",
            minWidth: "99px", // NOTE: fixed to prevent date wrap
          },
          [
            // h(Text, { fontSize: "sm" }, localizeDate(occurredAt)),
            showStatus && h(Status, { status }),
          ]
        ),
      ]),
      showOpps && !isEmpty(opps) && h(MentionsView, { opps }),
      showNote && h(NoteView, { note, maxLines, isObscured }),
    ]
  )
}

ConversationView.displayName = "ConversationView"

type ConversationPublishedViewProps = Omit<
  Props,
  "showStatus" | "showOpps" | "maxLines"
>
export const ConversationPublishedView: FC<ConversationPublishedViewProps> = (
  props
) =>
  h(ConversationView, {
    ...props,
    maxLines: 10,
    showStatus: false,
    showOpps: true,
    // showNote: false,
  })
