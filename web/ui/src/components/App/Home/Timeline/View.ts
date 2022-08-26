import {
  Divider,
  Heading,
  Spacer,
  List,
  ListItem,
  Text,
} from "@chakra-ui/react"
import { h } from "@cycle/react"
import { FC } from "react"
import { match } from "ts-pattern"
import {
  EmptyView,
  Props as EmptyViewProps,
} from "~/components/App/Home/Conversations/List/EmptyView"
import { isEmpty, isNotLastItem } from "~/fp"
import { TimelineEvent, ConversationPublished, Maybe, Customer } from "~/graph"
import { FullWidthVStack, Header, modalStyleProps, Nav } from "~/system"
import { ConversationView } from "~/components/Conversation/View"

// TODO: wat? minHeight?
const { minHeight } = modalStyleProps

export interface Props extends EmptyViewProps {
  viewer: Maybe<Customer>
  events: TimelineEvent[]
}

export const View: FC<Props> = ({ viewer, events, onClickNew }) =>
  isEmpty(events)
    ? h(EmptyView, { onClickNew })
    : h(FullWidthVStack, { minHeight }, [
        h(Nav),
        h(Header, {}, [
          //
          h(Heading, { size: "md" }, "Latest"),
          h(Spacer),
        ]),
        h(
          List,
          { spacing: 8, paddingTop: 4, width: "100%" },
          events.map((event, idx, all) =>
            match(event)
              .with(
                { __typename: "ConversationPublished" },
                ({ conversation, occurredAt }) =>
                  h(ListItem, {}, [
                    h(ConversationView, { viewer, conversation, maxLines: 10 }),
                    isNotLastItem(idx, all) && h(Divider, { padding: 4 }),
                  ])
              )
              .with({ __typename: "ContactProfileChanged" }, () => null)
              .exhaustive()
          )
        ),
      ])
