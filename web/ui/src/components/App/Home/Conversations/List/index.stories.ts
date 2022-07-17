import { h } from "@cycle/react"
import { Meta, Story } from "@storybook/react"
import { Props, View } from "./View"
import { ContainerView } from "../../index.stories"
import { Conversation } from "~/graph"
import { makeConversation } from "~/graph/models"

export default {
  title: "Components/Conversations/List",
  component: View,
  parameters: {
    controls: { hideNoControlsWarning: true },
  },
  decorators: [(Story) => h(ContainerView, [h(Story)])],
} as Meta

const value: Omit<Conversation, "status">[] = [
  makeConversation(),
  makeConversation(),
]

export const Default: Story<Props> = (args) => h(View, args)
Default.argTypes = {
  onClickConversation: { control: false, action: "onClickConversation" },
  conversations: { value },
}
