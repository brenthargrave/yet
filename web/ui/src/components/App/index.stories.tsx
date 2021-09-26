import { Story, Meta } from "@storybook/react"
import { h } from "@cycle/react"

import { App } from "."
import { View as LandingView } from "~/components/Landing/View"
import {
  View as PhoneSubmitView,
  Props as PhoneSubmitViewProps,
} from "~/components/Auth/PhoneSubmit/View"

export default {
  title: "App / Onboarding",
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

export const Landing: Story<LandingView> = () => h(LandingView)
Landing.storyName = "Landing page"

export const PhoneSubmit: Story<PhoneSubmitViewProps> = (args) =>
  h(PhoneSubmitView, { ...args })
PhoneSubmit.storyName = "Submit phone"
