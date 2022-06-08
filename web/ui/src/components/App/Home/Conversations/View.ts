import { h } from "@cycle/react"
import { isEmpty } from "ramda"
import { FC } from "react"
import { Button, Center, Heading, Stack } from "~/system"

const EmptyView: FC = () => h(Button, "hello")

export interface Conversation {}
export interface Props {
  conversations: Conversation[]
}
export const View = ({ conversations }: Props) =>
  // isEmpty(conversations) ? emptyView : listView
  h(EmptyView)
