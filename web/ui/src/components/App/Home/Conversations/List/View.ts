import { Heading, List, ListItem, Spacer } from "@chakra-ui/react"
import { h } from "@cycle/react"
import { FC } from "react"
import { ConversationView } from "~/components/Conversation"
import { NoteView } from "~/components/Note"
import { isEmpty, map } from "~/fp"
import { Conversation, Customer, Maybe } from "~/graph"
import { localizeDate } from "~/i18n"
import {
  Nav,
  CreateButton,
  Divider,
  Header,
  Stack,
  Status,
  Text,
  FullWidthVStack,
} from "~/system"
import { ParticipantsView } from "~/system/ParticipantsView"
import { EmptyView, OnClickNew } from "./EmptyView"

type OnClickConversation = (c: Conversation) => void

const isNotLastItem = (idx: number, all: Conversation[]) =>
  !(idx + 1 === all.length)

export interface Props {
  viewer: Maybe<Customer>
  conversations: Conversation[]
  onClickNew?: OnClickNew
  onClickConversation: OnClickConversation
}

export const View: FC<Props> = ({
  viewer,
  conversations,
  onClickNew,
  onClickConversation,
}) =>
  isEmpty(conversations)
    ? h(EmptyView, { onClickNew })
    : h(FullWidthVStack, {}, [
        h(Nav, {}),
        h(Header, [
          h(Heading, { size: "md" }, "Conversations"),
          h(Spacer),
          h(CreateButton, { onClick: onClickNew }),
        ]),
        h(
          List,
          { spacing: 8, paddingTop: 4, width: "100%" },
          conversations.map((conversation, idx, all) => {
            const { creator, signatures, invitees, note, occurredAt, status } =
              conversation
            const signers = map((sig) => sig.signer, signatures)
            return h(
              ListItem,
              {
                padding: 0,
                style: { cursor: "pointer" },
                onClick: (event: React.MouseEvent<HTMLElement>) => {
                  // NOTE: ignore markdown link clicks
                  // @ts-ignore
                  const { href } = event.target
                  if (!href) onClickConversation(conversation)
                },
              },
              [
                h(ConversationView, { viewer, conversation, maxLines: 10 }),
                isNotLastItem(idx, all) && h(Divider, { padding: 4 }),
              ]
            )
          })
        ),
      ])

View.displayName = "ConversationListView"
