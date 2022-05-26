import { Story, Meta } from "@storybook/react"
import { h } from "@cycle/react"

import { Stat } from "@chakra-ui/react"
import { t } from "~/i18n"
import { View, Props, State } from "./View"

export default {
  title: "Components/Onboarding",
  component: View,
  parameters: {
    // controls: { hideNoControlsWarning: true },
  },
} as Meta

export const Default: Story<Props> = (args) => h(View, args)

Default.args = {
  headingCopy: t(`onboarding.name.headingCopy`),
  inputPlaceholder: t(`onboarding.name.inputPlaceholer`),
  submitButtonCopy: t(`onboarding.name.submitButtonCopy`),
}
