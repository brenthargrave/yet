import { h, ReactSource } from "@cycle/react"
import { map, of } from "rxjs"
import { match } from "ts-pattern"
import { t } from "~/i18n"
import { Source as GraphSource } from "~/graph"
import { View } from "./View"

interface Sources {
  react: ReactSource
  graph: GraphSource
}

export const Onboarding = ({ graph }: Sources) => {
  const { me$ } = graph

  const state$ = me$.pipe(
    map((me) => {
      match(me)
    })
  )

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
