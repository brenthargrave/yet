import { ComponentStory, ComponentMeta } from "@storybook/react"
import { h } from "@cycle/react"

import { view } from "./view"

export default {
  title: "Landing",
  component: view,
  argTypes: {
    // backgroundColor: { control: "color" },
  },
} as ComponentMeta<typeof view>

// @ts-ignore
const Story: ComponentStory<typeof view> = (args) => h(view, args)

export const Primary = Story.bind({})
// Default.args = {
//   primary: true,
//   label: "Button",
// }
