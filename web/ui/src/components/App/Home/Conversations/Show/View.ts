import { Divider, Spacer } from "@chakra-ui/react"
import { h } from "@cycle/react"
import { FC } from "react"
import { Conversation } from "~/graph"
import { localizeDate } from "~/i18n"
import {
  BackButton,
  Header,
  Heading,
  MarkdownView,
  Stack,
  Text,
} from "~/system"

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
        h(Heading, { size: "md" }, "Conversation"),
        // h(BackButton, {
        //   onClick: onClickBack,
        // }),
        h(Spacer),
        h(Text, {}, localizeDate(occurredAt)),
      ]),
      h(Stack, { direction: "column", width: "100%", padding: 4 }, [
        h(MarkdownView, { md: note ?? "" }),
        // TODO: <Creator>
        // with <participants>
        // note view
      ]),
    ]
  )
