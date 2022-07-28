import { h } from "@cycle/react"
import { Meta, Story } from "@storybook/react"
import { makeConversation } from "~/graph/models"
import { Props, View, Step } from "./View"

export default {
  title: "Components/Conversations/Sign",
  component: View,
  parameters: {
    controls: { hideNoControlsWarning: true },
  },
} as Meta

export const Default: Story<Props> = (args) => h(View, args)

Default.argTypes = {
  step: {
    control: "radio",
    options: [Step.Auth, Step.Sign],
    value: Step.Sign,
  },
  conversation: { defaultValue: makeConversation() },
}
