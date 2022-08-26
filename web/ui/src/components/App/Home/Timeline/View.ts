import { Heading, Spacer, List, ListItem, Text } from "@chakra-ui/react"
import { h } from "@cycle/react"
import { FC } from "react"
import { match } from "ts-pattern"
import {
  EmptyView,
  Props as EmptyViewProps,
} from "~/components/App/Home/Conversations/List/EmptyView"
import { isEmpty } from "~/fp"
import { TimelineEvent, ConversationPublished } from "~/graph"
import { FullWidthVStack, Header, modalStyleProps, Nav } from "~/system"

// TODO: wat? minHeight?
const { minHeight } = modalStyleProps

export interface Props extends EmptyViewProps {
  events: TimelineEvent[]
}

export const View: FC<Props> = ({ events, onClickNew }) =>
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
          events.map((event, idx, all) => {
            return match(event)
              .with(
                { __typename: "ConversationPublished" },
                ({ conversation }) => h("span", conversation.status)
                // h(ListItem, {}, [
                //   //
                //   h(Text, conversation.status),
                // ])
              )
              .run()
            // .otherwise(() => h("b", "loading"))
          })
        ),
      ])
