import { h } from "@cycle/react"
import { FC } from "react"
import { NoteView } from "~/components/Note"
import { map, pluck } from "~/fp"
import { Conversation } from "~/graph"
import { localizeDate, t, toSentence } from "~/i18n"
import { Flex, Heading, MarkdownView, Spacer, Stack, Text } from "~/system"

const bold = (inner: string) => `**${inner}**`

// export enum Step {
//   Auth = "auth",
//   Sign = "sign",
// }

export interface Props {
  // step?: Step
  conversation: Conversation
  // onClickAuth?: () => void
  // onClickSign?: () => void
  // isSignLoading?: boolean
}

export const View: FC<Props> = ({
  // step = Step.Auth,
  conversation: { occurredAt, invitees, creator, note },
  // onClickAuth,
  // onClickSign,
  // isSignLoading = false,
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
      h(
        Stack,
        {
          direction: "column",
          width: "100%",
          padding: 4,
          gap: 4,
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
