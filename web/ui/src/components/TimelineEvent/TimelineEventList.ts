import { Divider } from "@chakra-ui/react"
import { h } from "@cycle/react"
import { FC } from "react"
import {} from "remeda"
import { match } from "ts-pattern"
import { ConversationPublishedView } from "~/components/Conversation/View"
import { isNotLastItem } from "~/fp"
import { Conversation, Customer, TimelineEvent } from "~/graph"
import { FullWidthList, LinkedListItem } from "~/system"

export interface Props {
  viewer: Customer
  events: TimelineEvent[]
  onClickConversation?: (conversation: Conversation) => void
}

export const View: FC<Props> = ({ events, viewer, onClickConversation }) =>
  h(FullWidthList, [
    events.map((event, idx, all) =>
      match(event)
        .with({ __typename: "ConversationPublished" }, ({ conversation }) =>
          h(
            LinkedListItem,
            {
              key: idx,
              onClick: () =>
                onClickConversation && onClickConversation(conversation),
            },
            [
              h(ConversationPublishedView, {
                viewer,
                conversation,
              }),
              isNotLastItem(idx, all) && h(Divider, { padding: 4 }),
            ]
          )
        )
        .with({ __typename: "ContactProfileChanged" }, () => null)
        .run()
    ),
  ])
