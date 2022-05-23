import { h, ReactSource } from "@cycle/react"
import { filter, map, of } from "rxjs"
import { find, has, isNil, prop, propSatisfies } from "ramda"
import { isNotNullish } from "rxjs-etc"
import { t } from "~/i18n"
import { Source as GraphSource } from "~/graph"
import { View } from "./View"
import { makeObservableCallback } from "~/rx"
import { makeTagger } from "~/log"

const tag = makeTagger("Onboarding")

interface Sources {
  react: ReactSource
  graph: GraphSource
}

const attributes = ["name", "org", "role"]

export const Onboarding = ({ graph: { me$ } }: Sources) => {
  const [submit$, onSubmit] = makeObservableCallback<void>()
  const [value$, onChangeInput] = makeObservableCallback<string>()

  const state$ = me$.pipe(
    map((me) => find((attr) => propSatisfies(isNil, attr, me), attributes)),
    filter(isNotNullish),
    tag("state$")
  )

  /*
  TODO: onboarding flow:
  - What's your full name? (name)
  - Where do you work? (org)
  - What's your role there? (role)
  */
  const props = {
    onChangeInput: () => null,
    inputValue: "",
    isSubmitButtonDisabled: false,
    isInputDisabled: false,
    onSubmit,
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
