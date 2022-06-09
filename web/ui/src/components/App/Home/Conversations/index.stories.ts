import { h } from "@cycle/react"
import { Meta, Story } from "@storybook/react"
import { Props, View } from "./View"
import { ContainerView } from "../index.stories"

export default {
  title: "Components/App/Home/Conversations",
  component: View,
  parameters: {
    controls: { hideNoControlsWarning: true },
  },
  decorators: [(Story) => h(ContainerView, [h(Story)])],
} as Meta

export const Default: Story<Props> = (args) => h(View, args)
Default.argTypes = {}
