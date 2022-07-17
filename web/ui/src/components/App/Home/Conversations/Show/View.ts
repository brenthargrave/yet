import { Divider, Spacer } from "@chakra-ui/react"
import { h } from "@cycle/react"
import { FC } from "react"
import { Conversation } from "~/graph"
import { localizeDate } from "~/i18n"
import { BackButton, Header, Heading, Stack, Text } from "~/system"

export interface Props {
  conversation: Conversation
}

export const View: FC<Props> = ({ conversation }) =>
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
        h(Text, {}, localizeDate(conversation.occurredAt)),
      ]),
      h(Stack, { direction: "column", width: "100%", padding: 4 }, [
        // h(Stack, { direction: "row" }, [
        //   h(Heading, {}, "Conversation"),
        //   h(Spacer),
        // ]),
        // Conversation
        // <Creator> with <names>
        // note view
      ]),
    ]
  )
