import { Heading, List, ListItem, Spacer } from "@chakra-ui/react"
import { h } from "@cycle/react"
import { FC } from "react"
import { ConversationView } from "~/components/Conversation/View"
import { isEmpty, map, isNotLastItem } from "~/fp"
import { Conversation, Customer, Maybe } from "~/graph"
import { CreateButton, Divider, FullWidthVStack, Header, Nav } from "~/system"
import { EmptyView, OnClickNew } from "./EmptyView"

type OnClickConversation = (c: Conversation) => void

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
