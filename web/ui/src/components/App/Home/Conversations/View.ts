import { h } from "@cycle/react"
import { FC } from "react"
import { EmptyView, OnClickNew } from "./EmptyView"

export interface Conversation {}

export interface Props {
  conversations: Conversation[]
  onClickNew?: OnClickNew
}

export const View: FC<Props> = ({ conversations, onClickNew }) =>
  // TODO: isEmpty(conversations) ? emptyView : listView
  h(EmptyView, { onClickNew })

View.displayName = "ConversationView"
