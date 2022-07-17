import { h } from "@cycle/react"
import { Meta, Story } from "@storybook/react"
import { type } from "os"
import { Props, View } from "../Form/View"

export default {
  title: "Components/Conversations/Edit",
  component: View,
  parameters: {
    controls: { hideNoControlsWarning: true },
  },
} as Meta

export const Default: Story<Props> = (args) => h(View, args)
Default.argTypes = {
  onSelect: { control: false, action: "onSelect" },
  options: [{ value: "1", label: "Brent Hargrave" }],
  isOpenPublish: {
    control: { type: "boolean", value: true },
  },
}
