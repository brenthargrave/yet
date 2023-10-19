import { Divider, Spacer } from "@chakra-ui/react"
import { h } from "@cycle/react"
import { FC, ReactNode } from "react"
import { Props as NoteViewProps } from "~/components/Notes/Single/Show/View"
import {
  NoteViewModel,
  Props as NotesViewProps,
  View as NotesView,
} from "~/components/Notes/View"
import { isEmpty, map } from "~/fp"
import { ariaLabelValue, Conversation, Customer, Maybe } from "~/graph"
import { localizeDate } from "~/i18n"
import { ariaLabel, Stack, Status, Text } from "~/system"
import { ParticipantsView } from "~/system/ParticipantsView"
import { MentionsView } from "./MentionsView"

export interface Props extends Omit<NoteViewProps, "note" | "text" | "status"> {
  readOnly?: boolean
  viewer: Maybe<Customer>
  conversation: Conversation
  showStatus?: boolean
  showNote?: boolean
  showOpps?: boolean
  notesView?: ReactNode
}

export const ConversationView: FC<Props> = ({
  readOnly,
  viewer,
  conversation,
  maxLines,
  isObscured,
  showStatus = true,
  showNote = true,
  showOpps = false,
  notesView,
}) => {
  const { creator, participations, invitees, occurredAt, status, opps, id } =
    conversation

  const participants = map((p) => p.participant, participations)

  const notes: NoteViewModel[] = conversation.notes.map((note) => {
    return {
      ...note,
      isDeleting: false,
      isPosting: false,
    }
  })

  const notesViewProps: NotesViewProps = {
    viewer,
    conversationID: id,
    notes,
    readOnly,
    maxLines,
    isObscured,
  }

  const key = `/c/${id}`

  return h(
    Stack,
    {
      //
      key,
      id: key,
      direction: "column",
      ...ariaLabel(ariaLabelValue(conversation)),
      className: "conversation",
      // @ts-ignore
      "data-conversation-id": id,
    },
    [
      h(Stack, { direction: "row", alignItems: "end" }, [
        h(Stack, { direction: "column", alignItems: "start" }, [
          h(ParticipantsView, {
            viewer,
            status,
            creator,
            invitees,
            participants,
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
      showNote && !!notesView ? notesView : h(NotesView, notesViewProps),
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
    readOnly: true,
    // showNote: false,
  })

export const ConversationDivider: FC = () => h(Divider, { pt: 4, pb: 4 })
