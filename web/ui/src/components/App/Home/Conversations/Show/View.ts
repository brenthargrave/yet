import { h } from "@cycle/react"
import { FC } from "react"
import { Conversation } from "~/graph"
import { localizeDate, toSentence } from "~/i18n"
import {
  Divider,
  Header,
  Heading,
  MarkdownView,
  Spacer,
  Stack,
  Text,
} from "~/system"
import { pluck, map } from "~/fp"

const bold = (inner: string) => `**${inner}**`

export interface Props {
  conversation: Conversation
}

export const View: FC<Props> = ({
  conversation: { occurredAt, note, creator, invitees },
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
      h(Stack, { direction: "column", width: "100%", padding: 4, gap: 2 }, [
        h(Stack, { direction: "row" }, [
          h(Heading, { size: "md" }, "Conversation"),
          h(Spacer),
          h(Text, {}, localizeDate(occurredAt)),
        ]),
        h(Stack, { direction: "row" }, [
          // h(Text, { as: "b" }, creator.name),
          // h(Spacer),
          h(MarkdownView, {
            md: `${bold(creator.name)} with ${toSentence(
              map(bold, pluck("name", invitees))
            )}`,
          }),
          // h(Text, {}, localizeDate(occurredAt)),
        ]),
        h(Stack, { direction: "row" }, [
          // h(Text, { as: "b" }, toSentence(pluck("name", invitees))),
        ]),
        h(MarkdownView, { md: note }),
      ]),
    ]
  )
