import { Story, Meta } from "@storybook/react"
import { h } from "@cycle/react"

import { View, Props } from "~/components/Landing/View"

export default {
  title: "Components/Landing",
  component: View,
  parameters: {
    controls: { hideNoControlsWarning: true },
  },
} as Meta

export const Default: Story<Props> = (args) => h(View, args)
Default.argTypes = {
  onClickJoin: { control: false, action: "join" },
  onClickLogin: { control: false, action: "login" },
}
