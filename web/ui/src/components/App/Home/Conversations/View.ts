import { h } from "@cycle/react"
import { FC } from "react"
import { EmptyView } from "./EmptyView"

export interface Conversation {}

export interface Props {
  conversations: Conversation[]
}

export const View: FC<Props> = ({ conversations }) =>
  // TODO: isEmpty(conversations) ? emptyView : listView
  h(EmptyView)

View.displayName = "ConversationView"
