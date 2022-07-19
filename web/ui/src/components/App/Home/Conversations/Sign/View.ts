import { resultKeyNameFromField } from "@apollo/client/utilities"
import { h } from "@cycle/react"
import { FC } from "react"
import { Result } from "ts-results"
import { NoteView } from "~/components/Note"
import { map, pluck } from "~/fp"
import { Conversation, UserError } from "~/graph"
import { localizeDate, toSentence } from "~/i18n"
import { Header, Heading, MarkdownView, Spacer, Stack, Text } from "~/system"

const bold = (inner: string) => `**${inner}**`

export interface Props {
  conversation: Conversation
}

export const View: FC<Props> = ({
  conversation: { occurredAt, invitees, creator, note },
}) =>
  h(
    Stack,
    {
      direction: "column",
      align: "start",
      justifyContent: "flex-start",
    },
    [
      h(Header, [
        // h(BackButton, { onClick }),
        h(Spacer),
      ]),
      h(Stack, { direction: "column", width: "100%", padding: 4, gap: 4 }, [
        h(Stack, { direction: "row" }, [
          h(Heading, { size: "md" }, "Conversation"),
          h(Spacer),
          h(Text, {}, localizeDate(occurredAt)),
        ]),
        h(Stack, { direction: "column", gap: 1 }, [
          h(MarkdownView, {
            md: `${bold(creator.name)} with ${toSentence(
              map(bold, pluck("name", invitees))
            )}`,
          }),
          h(NoteView, { note }),
        ]),
      ]),
    ]
  )
