import { h } from "@cycle/react"
import { Meta, Story } from "@storybook/react"
import { Props, View } from "./View"
import { ContainerView } from "../../index.stories"

export default {
  title: "Components/Conversations/List",
  component: View,
  parameters: {
    controls: { hideNoControlsWarning: true },
  },
  decorators: [(Story) => h(ContainerView, [h(Story)])],
} as Meta

export const Default: Story<Props> = (args) => h(View, args)
Default.argTypes = {
  conversations: {
    defaultValue: [
      // stub
      {
        id: "1",
        invitees: [
          {
            id: "1",
            name: "John Doe",
          },
        ],
        note: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
      },
    ],
  },
}
