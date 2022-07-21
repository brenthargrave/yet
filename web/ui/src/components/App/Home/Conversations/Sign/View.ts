import { h } from "@cycle/react"
import { FC } from "react"
import { NoteView } from "~/components/Note"
import { map, pluck } from "~/fp"
import { Conversation } from "~/graph"
import { localizeDate, toSentence } from "~/i18n"
import { Header, Heading, MarkdownView, Spacer, Stack, Text } from "~/system"

const bold = (inner: string) => `**${inner}**`

export interface Props {
  conversation: Conversation
}

export const View: FC<Props> = ({
  conversation: { occurredAt, invitees, creator, note },
}) => {
  return h(
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
      h(
        Stack,
        {
          direction: "column",
          width: "100%",
          padding: 4,
          gap: 4,
          style: {
            // TODO: blur on initial prompt?
            // color: "transparent",
            // textShadow: "0 0 10px rgba(0,0,0,0.5)",
          },
        },
        [
          h(Stack, { direction: "row" }, [
            h(Heading, { size: "md" }, "Conversation"),
            h(Spacer),
          ]),
          h(Stack, { direction: "column", gap: 1 }, [
            h(Stack, { direction: "row" }, [
              h(MarkdownView, {
                md: `${bold(creator.name)} with ${toSentence(
                  map(bold, pluck("name", invitees))
                )}`,
              }),
              h(Spacer),
              h(Text, localizeDate(occurredAt)),
            ]),
            h(NoteView, { note }),
          ]),
        ]
      ),
    ]
  )
}
