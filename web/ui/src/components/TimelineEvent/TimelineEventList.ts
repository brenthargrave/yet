import { Divider } from "@chakra-ui/react"
import { h } from "@cycle/react"
import { FC } from "react"
import { match } from "ts-pattern"
import { ConversationPublishedView } from "~/components/Conversation/View"
import { isNotLastItem } from "~/fp"
import { Conversation, Customer, Maybe, TimelineEvent } from "~/graph"
import { canViewNotes } from "~/graph/models/timeline"
import { FullWidthList, LinkedListItem } from "~/system"

export interface Props {
  viewer: Customer
  events: TimelineEvent[] | Maybe<TimelineEvent[]>
  onClickConversation?: (conversation: Conversation) => void
}

export const TimelineEventList: FC<Props> = ({
  events = [],
  viewer,
  onClickConversation,
}) =>
  h(FullWidthList, [
    (events ?? []).map((event, idx, all) =>
      match(event)
        .with(
          { __typename: "ConversationPublished" },
          ({ persona, conversation }) =>
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
                  showNote: canViewNotes(persona),
                }),
                isNotLastItem(idx, all) && h(Divider, { padding: 4 }),
              ]
            )
        )
        .with({ __typename: "ContactProfileChanged" }, () => null)
        .run()
    ),
  ])
