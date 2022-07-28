import { h } from "@cycle/react"
import { Meta, Story } from "@storybook/react"
import { makeConversation } from "~/graph/models"
import { Props, View, Step, Intent } from "./View"

export default {
  title: "Components/Conversations/Show",
  component: View,
  parameters: {
    controls: { hideNoControlsWarning: true },
  },
} as Meta

export const Default: Story<Props> = (args) => h(View, args)

Default.argTypes = {
  conversation: { defaultValue: makeConversation() },
  intent: {
    control: "radio",
    options: [Intent.Read, Intent.Sign],
    value: Intent.Read,
  },
  step: {
    control: "radio",
    options: [Step.Auth, Step.Sign],
    value: Step.Sign,
  },
  //  read
  isOpenShare: {
    control: "boolean",
  },
}
