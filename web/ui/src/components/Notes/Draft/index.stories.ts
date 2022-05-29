import { h } from "@cycle/react"
import { Meta, Story } from "@storybook/react"
import { Props, View } from "~/components/Notes/Draft/View"

export default {
  title: "Components/Notes/Draft",
  component: View,
  parameters: {
    controls: { hideNoControlsWarning: true },
  },
} as Meta

export const Default: Story<Props> = (args) => h(View, args)
Default.argTypes = {
  onSelect: { control: false, action: "selected" },
  options: [{ value: "1", label: "Brent Hargrave" }],
}
