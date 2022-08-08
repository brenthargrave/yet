import { h } from "@cycle/react"
import { Meta, Story } from "@storybook/react"
import { DraftConversation } from "~/graph"
import { makeConversation } from "~/graph/models"
import { ContainerView } from "../../index.stories"
import { Props, View } from "./View"

export default {
  title: "Components/Opps/List",
  component: View,
  parameters: {
    controls: { hideNoControlsWarning: true },
  },
  decorators: [(Story) => h(ContainerView, [h(Story)])],
} as Meta

const value: DraftConversation[] = [makeConversation(), makeConversation()]

export const Default: Story<Props> = (args) => h(View, args)
Default.argTypes = {
  // onClickConversation: { control: false, action: "onClickConversation" },
  // conversations: { value },
}
