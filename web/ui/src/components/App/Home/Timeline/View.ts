import { Divider, Heading, Spacer } from "@chakra-ui/react"
import { h } from "@cycle/react"
import { FC } from "react"
import { match } from "ts-pattern"
import { ConversationPublishedView } from "~/components/Conversation/View"
import { isEmpty, isNotLastItem } from "~/fp"
import { Conversation, Customer, Maybe, TimelineEvent } from "~/graph"
import {
  containerProps,
  FullWidthList,
  FullWidthVStack,
  Header,
  LinkedListItem,
  Nav,
} from "~/system"
import { EmptyView, Props as EmptyViewProps } from "./EmptyView"

export enum State {
  loading = "loading",
  ready = "ready",
}

export interface Props extends EmptyViewProps {
  state: State
  viewer: Maybe<Customer>
  events: TimelineEvent[]
  onClickConversation: (c: Conversation) => void
}

export const View: FC<Props> = ({
  state,
  viewer,
  events,
  onClickNew,
  onClickConversation,
}) =>
  state === State.loading
    ? null
    : isEmpty(events)
    ? h(EmptyView, { onClickNew, ...containerProps })
    : h(FullWidthVStack, { ...containerProps }, [
        h(Nav),
        h(Header, {}, [
          //
          h(Heading, { size: "md" }, "Latest"),
          h(Spacer),
        ]),
        h(FullWidthList, [
          events.map((event, idx, all) =>
            match(event)
              .with(
                { __typename: "ConversationPublished" },
                ({ conversation }) =>
                  h(
                    LinkedListItem,
                    {
                      key: idx,
                      onClick: () => onClickConversation(conversation),
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
        ]),
      ])
