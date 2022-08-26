import { Heading, Spacer, List, ListItem, Text } from "@chakra-ui/react"
import { h } from "@cycle/react"
import { FC } from "react"
import { match } from "ts-pattern"
import {
  EmptyView,
  Props as EmptyViewProps,
} from "~/components/App/Home/Conversations/List/EmptyView"
import { isEmpty } from "~/fp"
import { TimelineEvent, TimelineEventType } from "~/graph"
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
          events.map(({ type, ...event }, idx, all) => {
            // return (
            //   type === TimelineEventType.ConversationPublished &&
            //   h(ListItem, {}, [h(Text, event.con )])
            // )
            return match(event).with(
              { type: TimelineEventType.ConversationPublished },
              ({ occurredAt }) => h("b", occurredAt)
            )
            //     return h(
            //       ListItem,
            //       {
            //         padding: 0,
            //         style: { cursor: "pointer" },
            //         onClick: (event: React.MouseEvent<HTMLElement>) => {
            //           // NOTE: ignore markdown link clicks
            //           // @ts-ignore
            //           const { href } = event.target
            //           if (!href) onClickConversation(conversation)
            //         },
            //       },
            //       [
            //         h(ConversationView, { viewer, conversation, maxLines: 10 }),
            //         isNotLastItem(idx, all) && h(Divider, { padding: 4 }),
            //       ]
            //     )
          })
        ),
      ])
