import { h } from "@cycle/react"
import { Meta, Story } from "@storybook/react"
import { Props, View } from "~/components/Landing/View"

export default {
  title: "Components/Notes/Draft",
  component: View,
  parameters: {
    controls: { hideNoControlsWarning: true },
  },
} as Meta

export const Default: Story<Props> = (args) => h(View, args)
Default.argTypes = {
  // onClickJoin: { control: false, action: "join" },
  // onClickLogin: { control: false, action: "login" },
}
