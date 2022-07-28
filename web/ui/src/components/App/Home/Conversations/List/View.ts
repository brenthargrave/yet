import { Heading, List, ListItem, Spacer } from "@chakra-ui/react"
import { h } from "@cycle/react"
import { FC } from "react"
import { NoteView } from "~/components/Note"
import { isEmpty, join, map, prop } from "~/fp"
import { Conversation } from "~/graph"
import { localizeDate } from "~/i18n"
import { CreateButton, Divider, Header, Stack, Text, Status } from "~/system"
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
        h(Header),
        h(Header, [
          h(Heading, { size: "md" }, "Conversations"),
          h(Spacer),
          h(CreateButton, { onClick: onClickNew }),
        ]),
        h(
          List,
          { spacing: 8, padding: 4 },
          conversations.map(
            ({ id, invitees, note, occurredAt, status }, idx, all) =>
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
                  h(Stack, { direction: "column" }, [
                    h(Stack, { direction: "row", alignItems: "start" }, [
                      h(Heading, { size: "xs" }, [
                        join(", ", map(prop("name"), invitees)),
                      ]),
                      h(Spacer),
                      h(Stack, { direction: "column" }, [
                        h(Text, { fontSize: "sm" }, localizeDate(occurredAt)),
                        h(Status, { status }),
                      ]),
                    ]),
                    h(NoteView, { note, maxLines: 10 }),
                  ]),
                  isNotLastItem(idx, all) && h(Divider, { padding: 4 }),
                ]
              )
          )
        ),
      ])

View.displayName = "Conversation.List.View"
