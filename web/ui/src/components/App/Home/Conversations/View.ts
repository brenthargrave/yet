import { h } from "@cycle/react"
import { EmptyView } from "./EmptyView"

export interface Conversation {}

export interface Props {
  conversations: Conversation[]
}

export const View = ({ conversations }: Props) =>
  // TODO: isEmpty(conversations) ? emptyView : listView
  h(EmptyView)
