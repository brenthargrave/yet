import { h } from "@cycle/react"
import { FC } from "react"
import { NoteView } from "~/components/Note"
import { map, pluck } from "~/fp"
import { Conversation } from "~/graph"
import { localizeDate, toSentence } from "~/i18n"
import {
  Flex,
  Header,
  Heading,
  MarkdownView,
  Spacer,
  Stack,
  Text,
} from "~/system"
import { View as AuthPrompt } from "./AuthPrompt"

const bold = (inner: string) => `**${inner}**`

export interface Props {
  conversation: Conversation
  requiresAuth?: boolean
  onClickAuth?: () => void
}

export const View: FC<Props> = ({
  conversation: { occurredAt, invitees, creator, note },
  requiresAuth = false,
  onClickAuth,
}) => {
  const creatorName = creator.name
  const occurredAtDesc = localizeDate(occurredAt)
  return h(
    Stack,
    {
      direction: "column",
      align: "start",
      justifyContent: "flex-start",
    },
    [
      h(AuthPrompt, {
        isOpen: requiresAuth,
        creatorName,
        occurredAtDesc,
        onClickAuth,
      }),
      h(Header, [
        // h(BackButton, { onClick }),
        h(Spacer),
      ]),
      h(
        Stack,
        {
          direction: "column",
          width: "100%",
          padding: 4,
          gap: 4,
          style: {
            ...(requiresAuth && {
              color: "transparent",
              textShadow: "0 0 10px rgba(0,0,0,0.5)",
            }),
          },
        },
        [
          h(Stack, { direction: "row" }, [
            h(Heading, { size: "md" }, "Conversation"),
            h(Spacer),
          ]),
          h(Stack, { direction: "column", gap: 1 }, [
            h(Flex, { justifyContent: "space-between", gap: 4 }, [
              h(MarkdownView, {
                md: `${bold(creatorName)} with ${toSentence(
                  map(bold, pluck("name", invitees))
                )}`,
              }),
              h(
                Text,
                { size: "xs", style: { whiteSpace: "nowrap" } },
                occurredAtDesc
              ),
            ]),

            h(NoteView, { note }),
          ]),
        ]
      ),
    ]
  )
}
