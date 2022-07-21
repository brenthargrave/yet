import { h } from "@cycle/react"
import { Meta, Story } from "@storybook/react"
import { makeConversation } from "~/graph/models"
import { Props, View } from "./View"

export default {
  title: "Components/Conversations/Sign",
  component: View,
  parameters: {
    controls: { hideNoControlsWarning: true },
  },
} as Meta

export const Default: Story<Props> = (args) => h(View, args)

Default.argTypes = {
  conversation: { defaultValue: makeConversation() },
  requiresAuth: { type: "boolean" },
}
