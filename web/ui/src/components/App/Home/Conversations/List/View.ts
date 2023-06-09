import { Heading, Spacer } from "@chakra-ui/react"
import { h } from "@cycle/react"
import { FC } from "react"
import { ConversationView } from "~/components/Conversation/View"
import { isEmpty, isNotLastItem } from "~/fp"
import { Conversation, Customer, Maybe } from "~/graph"
import {
  AriaHeading,
  containerProps,
  CreateButton,
  Divider,
  FullWidthList,
  FullWidthVStack,
  Header,
  LinkedListItem,
  Nav,
} from "~/system"
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
    ? h(EmptyView, { onClickNew, ...containerProps })
    : h(FullWidthVStack, { ...containerProps }, [
        h(Nav, {}),
        h(Header, [
          h(AriaHeading, { size: "md" }, "Your Conversations"),
          h(Spacer),
          h(CreateButton, { onClick: onClickNew }),
        ]),
        h(
          FullWidthList,
          conversations.map((conversation, idx, all) => {
            return h(
              LinkedListItem,
              { key: idx, onClick: () => onClickConversation(conversation) },
              [
                h(ConversationView, { viewer, conversation, maxLines: 10 }),
                isNotLastItem(idx, all) && h(Divider, { padding: 4 }),
              ]
            )
          })
        ),
      ])

View.displayName = "ConversationListView"
