import { Divider, Heading, List, ListItem, Spacer } from "@chakra-ui/react"
import { h } from "@cycle/react"
import { FC } from "react"
import { match } from "ts-pattern"
import {
  EmptyView,
  Props as EmptyViewProps,
} from "~/components/App/Home/Conversations/List/EmptyView"
import { ConversationView } from "~/components/Conversation/View"
import { isEmpty, isNotLastItem } from "~/fp"
import { Customer, Maybe, TimelineEvent } from "~/graph"
import { FullWidthVStack, Header, modalStyleProps, Nav } from "~/system"

export enum State {
  loading = "loading",
  ready = "ready",
}

// TODO: wat? minHeight?
const { minHeight } = modalStyleProps

export interface Props extends EmptyViewProps {
  state: State
  viewer: Maybe<Customer>
  events: TimelineEvent[]
}

// eslint-disable-next-line react/function-component-definition
export const View: FC<Props> = ({ state, viewer, events, onClickNew }) =>
  state === State.loading
    ? null // TODO: loading view instead?
    : isEmpty(events)
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
