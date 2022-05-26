import { h } from "@cycle/react"
import { action } from "@storybook/addon-actions"
import { Meta, Story } from "@storybook/react"
import { t } from "~/i18n"
import { Props, View } from "./View"

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
  onChangeInput: action("changed"),
}
