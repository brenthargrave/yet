import { Story, Meta } from "@storybook/react"
import { h } from "@cycle/react"

import { App } from "."
import { View as LandingView } from "~/components/Landing/View"
import { View as PhoneVerify } from "~/components/Auth/PhoneVerify/View"
import { View as PhoneSubmit } from "~/components/Auth/PhoneSubmit"

export default {
  title: "Onboarding",
  component: App,
} as Meta

// TODO
// @ts-ignore
// const Story: ComponentStory<typeof App> = (args) => h(App, args)
// export const Onboarding = Story.bind({})
// Default.args = {
//   primary: true,
//   label: "Button",
// }

// TODO
// export const Landing: Story<LandingView> = () => h(LandingView)

// export const Phone_Submit: Story<PhoneSubmit> = () => h(PhoneSubmit)

// export const Phone_Verify: ComponentStory<typeof PhoneVerify> = () =>
//   h(PhoneVerify)
