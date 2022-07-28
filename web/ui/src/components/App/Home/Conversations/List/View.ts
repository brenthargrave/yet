import { Heading, List, ListItem, Spacer } from "@chakra-ui/react"
import { h } from "@cycle/react"
import { FC } from "react"
import { NoteView } from "~/components/Note"
import { isEmpty, join, map, prop } from "~/fp"
import { Conversation } from "~/graph"
import { localizeDate } from "~/i18n"
import { CreateButton, Divider, Header, Stack, Text } from "~/system"
import { EmptyView, OnClickNew } from "./EmptyView"

type OnClickConversation = (cid: string) => void

export interface Props {
  conversations: Conversation[]
  onClickNew?: OnClickNew
  onClickConversation: OnClickConversation
}

const isNotLastItem = (idx: number, all: Conversation[]) =>
  !(idx + 1 === all.length)

export const View: FC<Props> = ({
  conversations,
  onClickNew,
  onClickConversation,
}) =>
  isEmpty(conversations)
    ? h(EmptyView, { onClickNew })
    : h(Stack, { direction: "column" }, [
        // h(Header),
        h(Header, [
          h(Heading, { size: "md" }, "Conversations"),
          h(Spacer),
          h(CreateButton, { onClick: onClickNew }),
        ]),
        h(
          List,
          { spacing: 8, padding: 4 },
          conversations.map(({ id, invitees, note, occurredAt }, idx, all) =>
            h(
              ListItem,
              {
                padding: 0,
                style: { cursor: "pointer" },
                onClick: (event: MouseEvent) => {
                  // NOTE: ignore markdown link clicks
                  // @ts-ignore
                  const { href } = event.target
                  if (!href) onClickConversation(id)
                },
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
                  h(NoteView, { note, maxLines: 10 }),
                ]),
                isNotLastItem(idx, all) && h(Divider),
              ]
            )
          )
        ),
      ])

View.displayName = "Conversation.List.View"
