import { Heading, List, ListItem, Spacer } from "@chakra-ui/react"
import { h } from "@cycle/react"
import { FC } from "react"
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
    : h(Stack, { direction: "column" }, [
        h(Nav, {}),
        h(Header, [
          h(Heading, { size: "md" }, "Conversations"),
          h(Spacer),
          h(CreateButton, { onClick: onClickNew }),
        ]),
        h(
          List,
          { spacing: 8, paddingTop: 4 },
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
                h(Stack, { direction: "column" }, [
                  h(Stack, { direction: "row", alignItems: "center" }, [
                    h(ParticipantsView, {
                      viewer,
                      status,
                      creator,
                      invitees,
                      signers,
                    }),
                    // h(Heading, { size: "sm" }, [
                    //   // TODO: replace invitees w/ state-dep list
                    //   join(", ", map(prop("name"), invitees)),
                    // ]),
                    h(Spacer),
                    h(Stack, { direction: "column", alignItems: "end" }, [
                      h(Text, { fontSize: "sm" }, localizeDate(occurredAt)),
                      h(Status, { status }),
                    ]),
                  ]),
                  h(NoteView, { note, maxLines: 10 }),
                ]),
                isNotLastItem(idx, all) && h(Divider, { padding: 4 }),
              ]
            )
          })
        ),
      ])

View.displayName = "ConversationListView"
