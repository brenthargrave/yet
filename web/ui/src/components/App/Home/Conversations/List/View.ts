import { List, ListItem } from "@chakra-ui/react"
import { h } from "@cycle/react"
import { FC } from "react"
import { isEmpty } from "~/fp"
import { EmptyView, OnClickNew } from "../EmptyView"
import { Conversation } from "~/graph"

type OnClickConversation = (cid: string) => void

export interface Props {
  conversations: Conversation[]
  onClickNew?: OnClickNew
  onClickConversation: OnClickConversation
}

export const View: FC<Props> = ({
  conversations,
  onClickNew,
  onClickConversation,
}) =>
  isEmpty(conversations)
    ? h(EmptyView, { onClickNew })
    : h(
        List,
        {},
        conversations.map(({ id }) =>
          h(
            ListItem,
            { style: { cursor: "pointer" }, onClick: onClickConversation(id) },
            [id]
          )
        )
      )

View.displayName = "Conversation.View"
