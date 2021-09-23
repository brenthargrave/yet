import { ComponentStory, ComponentMeta } from "@storybook/react"
import { h } from "@cycle/react"

import { App } from "."
import { Landing } from "~/components/Landing"
import { PhoneSubmit } from "../Auth/PhoneSubmit"

export default {
  title: "App/Onboarding",
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
