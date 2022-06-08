import { h } from "@cycle/react"
import { Meta, Story } from "@storybook/react"
import { Props, View } from "./View"
import { View as HomeView } from "../View"

export default {
  title: "Components/App/Home/Conversations",
  component: View,
  parameters: {
    controls: { hideNoControlsWarning: true },
  },
  decorators: [(Story) => h(HomeView, [h(Story)])],
} as Meta

export const Default: Story<Props> = (args) => h(View, args)
Default.argTypes = {
  // onSelect: { control: false, action: "selected" },
  // options: [{ value: "1", label: "Brent Hargrave" }],
}
