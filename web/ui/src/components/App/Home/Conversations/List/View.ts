import { List, ListItem } from "@chakra-ui/react"
import { h } from "@cycle/react"
import { isEmpty } from "ramda"
import { FC } from "react"
import { EmptyView, OnClickNew } from "../EmptyView"
import { Conversation } from "~/graph"

export interface Props {
  conversations: Conversation[]
  onClickNew?: OnClickNew
}

export const View: FC<Props> = ({ conversations, onClickNew }) =>
  isEmpty(conversations)
    ? h(EmptyView, { onClickNew })
    : h(
        List,
        {},
        conversations.map((c) => h(ListItem, c.id))
      )

View.displayName = "Conversation.View"
