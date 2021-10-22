import { Story, Meta } from "@storybook/react"
import { h } from "@cycle/react"

import { View, Props } from "./View"

export default {
  title: "Components/Auth/PhoneVerify",
  component: View,
  parameters: {
    controls: { hideNoControlsWarning: true },
  },
} as Meta

export const Default: Story<Props> = (args) => h(View, args)
Default.args = {
  codeLength: 6,
  e164: "+1234567890",
}
