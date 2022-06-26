import { List, ListItem } from "@chakra-ui/react"
import { h } from "@cycle/react"
import { isEmpty } from "ramda"
import { FC } from "react"
import { a } from "@cycle/react-dom"
import { EmptyView, OnClickNew } from "../EmptyView"
import { Conversation } from "~/graph"
import { routes } from "~/router"

interface RowProps {
  cid: string
}
const RowView: FC<RowProps> = ({ cid }) =>
  h(ListItem, {}, [a({ href: routes.editConversation({ id: cid }).href }, cid)])

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
        conversations.map((c) => h(RowView, { cid: c.id }))
      )

View.displayName = "Conversation.View"
