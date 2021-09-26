import { ComponentStory, ComponentMeta } from "@storybook/react"
import { h } from "@cycle/react"

import { App } from "."
import { Landing } from "~/components/Landing"
import { View as PhoneVerify } from "~/components/Auth/PhoneVerify/View"
import { PhoneSubmit } from "~/components/Auth/PhoneSubmit"

export default {
  title: "Onboarding",
  component: App,
  argTypes: {
    // backgroundColor: { control: "color" },
  },
} as ComponentMeta<typeof App>

// @ts-ignore
// const Story: ComponentStory<typeof App> = (args) => h(App, args)
// export const Onboarding = Story.bind({})
// Default.args = {
//   primary: true,
//   label: "Button",
// }

export const Pitch: ComponentStory<typeof Landing> = () => h(Landing)

export const Phone_Submit: ComponentStory<typeof PhoneSubmit> = () =>
  h(PhoneSubmit)

export const Phone_Verify: ComponentStory<typeof PhoneVerify> = () =>
  h(PhoneVerify)
