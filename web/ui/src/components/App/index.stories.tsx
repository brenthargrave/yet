import { ComponentStory, ComponentMeta } from "@storybook/react"
import { h } from "@cycle/react"

import { App } from "."
import { View as LandingView } from "~/components/Landing/View"
import { View as PhoneVerify } from "~/components/Auth/PhoneVerify/View"
import { PhoneSubmit } from "~/components/Auth/PhoneSubmit"

export default {
  title: "Onboarding",
  component: App,
  argTypes: {
    // backgroundColor: { control: "color" },
  },
} as ComponentMeta<typeof App>

// TODO
// @ts-ignore
// const Story: ComponentStory<typeof App> = (args) => h(App, args)
// export const Onboarding = Story.bind({})
// Default.args = {
//   primary: true,
//   label: "Button",
// }

export const Landing: ComponentStory<typeof LandingView> = () => h(LandingView)

export const Phone_Submit: ComponentStory<typeof PhoneSubmit> = () =>
  h(PhoneSubmit)

export const Phone_Verify: ComponentStory<typeof PhoneVerify> = () =>
  h(PhoneVerify)
