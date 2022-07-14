import { Box, Heading, List, ListItem, Spacer } from "@chakra-ui/react"
import { h } from "@cycle/react"
import { FC } from "react"
import { isEmpty, join, map, prop } from "~/fp"
import { Conversation } from "~/graph"
import { localizeDate } from "~/i18n"
import {
  CreateButton,
  Divider,
  Header,
  Stack,
  Text,
  MarkdownView,
} from "~/system"
import { EmptyView, OnClickNew } from "../EmptyView"

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
    : h(Stack, { direction: "column" }, [
        h(Header, [
          h(Heading, { size: "md" }, "Conversations"),
          h(Spacer),
          h(CreateButton, { onClick: onClickNew }),
        ]),
        h(
          List,
          { spacing, padding: 4 },
          conversations.map(({ id, invitees, note, occurredAt }) =>
            h(
              ListItem,
              {
                style: { cursor: "pointer" },
                onClick: () => onClickConversation(id),
                padding: 0,
              },
              [
                h(Stack, { direction: "column", paddingBottom: 4 }, [
                  h(
                    Stack,
                    {
                      direction: "row",
                      alignItems: "center",
                    },
                    [
                      h(Heading, { size: "xs" }, [
                        join(", ", map(prop("name"), invitees)),
                      ]),
                      h(Spacer),
                      h(Text, { fontSize: "sm" }, localizeDate(occurredAt)),
                    ]
                  ),
                  h(
                    Box,
                    { padding: 2, borderWidth: "1px", borderRadius: "lg" },
                    [h(MarkdownView, { maxLines: 10, md: note ?? "" })]
                  ),
                ]),
                h(Divider),
              ]
            )
          )
        ),
      ])

View.displayName = "Conversation.List.View"
