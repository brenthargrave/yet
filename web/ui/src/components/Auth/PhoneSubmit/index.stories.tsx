import { Story, Meta } from "@storybook/react"
import { h } from "@cycle/react"

import { View, Props } from "./View"

export default {
  title: "Components/Auth/PhoneSubmit",
  component: View,
  parameters: {
    controls: { hideNoControlsWarning: true },
  },
} as Meta

export const Default: Story<Props> = (args) => h(View, args)
Default.argTypes = {
  onSubmit: { control: false, action: "submit" },
  onChangePhoneInput: { control: false },
}
