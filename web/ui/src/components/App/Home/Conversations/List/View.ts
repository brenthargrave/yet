import { Heading, List, ListItem } from "@chakra-ui/react"
import { h } from "@cycle/react"
import { FC } from "react"
import { isEmpty } from "~/fp"
import { EmptyView, OnClickNew } from "../EmptyView"
import { Conversation } from "~/graph"
import { Box, Stack } from "~/system"

type OnClickConversation = (cid: string) => void

export interface Props {
  conversations: Conversation[]
  onClickNew?: OnClickNew
  onClickConversation: OnClickConversation
}

export const View: FC<Props> = ({
  conversations,
  onClickNew,
  onClickConversation,
}) =>
  isEmpty(conversations)
    ? h(EmptyView, { onClickNew })
    : h(Stack, { direction: "column", spacing: 2, padding: 4 }, [
        h(Heading, {}, "Conversations"),
        h(
          List,
          {},
          conversations.map(({ id }) =>
            h(
              ListItem,
              {
                style: { cursor: "pointer" },
                onClick: () => onClickConversation(id),
                padding: 2,
              },
              [
                // TODO:
                // names
                // smaller text... elipsis   [date]
                id,
              ]
            )
          )
        ),
      ])

View.displayName = "Conversation.View"
