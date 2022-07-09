import { Heading, List, ListItem } from "@chakra-ui/react"
import { h } from "@cycle/react"
import { FC } from "react"
import { isEmpty, prop, map, join } from "~/fp"
import { EmptyView, OnClickNew } from "../EmptyView"
import { Conversation } from "~/graph"
import { Box, Divider, Stack, Text } from "~/system"

type OnClickConversation = (cid: string) => void

export interface Props {
  conversations: Conversation[]
  onClickNew?: OnClickNew
  onClickConversation: OnClickConversation
}

const spacing = 4

export const View: FC<Props> = ({
  conversations,
  onClickNew,
  onClickConversation,
}) =>
  isEmpty(conversations)
    ? h(EmptyView, { onClickNew })
    : h(Stack, { direction: "column", spacing: 6, padding: 4 }, [
        h(Heading, { size: "md" }, "Conversations"),
        h(
          List,
          { spacing },
          conversations.map(({ id, invitees, note }) =>
            h(
              ListItem,
              {
                style: { cursor: "pointer" },
                onClick: () => onClickConversation(id),
                padding: 0,
              },
              [
                h(Stack, { direction: "column" }, [
                  h(Heading, { size: "xs" }, [
                    join(", ", map(prop("name"), invitees)),
                  ]),
                  h(
                    Text,
                    {
                      noOfLines: 1,
                      fontSize: "sm",
                    },
                    [note]
                  ),
                  h(Divider),
                ]),
              ]
            )
          )
        ),
      ])

View.displayName = "Conversation.List.View"
