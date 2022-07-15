import { h } from "@cycle/react"
import { Meta, Story } from "@storybook/react"
import { Props, View } from "./View"
import { ContainerView } from "../../index.stories"
import { Conversation } from "~/graph"

export default {
  title: "Components/Conversations/List",
  component: View,
  parameters: {
    controls: { hideNoControlsWarning: true },
  },
  decorators: [(Story) => h(ContainerView, [h(Story)])],
} as Meta

const defaultValue: Omit<Conversation, "status">[] = [
  // stub
  {
    id: "1",
    occurredAt: new Date(),
    invitees: [
      {
        id: "1",
        name: "John Doe",
      },
    ],
    note: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
  },
  {
    id: "2",
    occurredAt: new Date(),
    invitees: [
      {
        id: "2",
        name: "Jane Doe",
      },
    ],
    note: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
  },
]

export const Default: Story<Props> = (args) => h(View, args)
Default.argTypes = {
  onClickConversation: { control: false, action: "onClickConversation" },
  conversations: { defaultValue },
}
