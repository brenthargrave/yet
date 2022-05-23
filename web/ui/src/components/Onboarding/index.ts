import { h, ReactSource } from "@cycle/react"
import { of } from "rxjs"
import { View } from "./View"
import { t } from "~/i18n"

interface Sources {
  react: ReactSource
}

export const Onboarding = (sources: Sources) => {
  /*
  TODO: onboarding flow:
  - What's your full name? (name)
  - Where do you work? (org)
  - What's your role there? (role)
  */
  const props = {
    onChangeInput: () => null,
    isSubmitButtonDisabled: false,
    isInputDisabled: false,
    onSubmit: () => null,
    isLoading: false,
    headingCopy: t(`onboarding.name.headingCopy`),
    inputPlaceholder: t(`onboarding.name.inputPlaceholer`),
    submitButtonCopy: t(`onboarding.name.submitButtonCopy`),
  }
  const react = of(h(View, { ...props }))

  return {
    react,
  }
}
