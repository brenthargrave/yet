import { h, ReactSource } from "@cycle/react"
import {
  BehaviorSubject,
  combineLatest,
  filter,
  map,
  of,
  share,
  shareReplay,
  startWith,
  switchMap,
  withLatestFrom,
} from "rxjs"
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
  const value$$ = new BehaviorSubject<string>("")
  const inputValue$ = value$$
    .asObservable()
    .pipe(tag("inputValue$"), shareReplay())
  const onChangeInput = (value: string) => value$$.next(value)

  const [_submit$, onSubmit] = makeObservableCallback<void>()
  const submit$ = _submit$.pipe(tag("submit$"), share())

  const attr$ = me$.pipe(
    map((me) => find((attr) => propSatisfies(isNil, attr, me), attributes)),
    filter(isNotNullish),
    tag("state$")
  )

  const result$ = submit$.pipe(
    withLatestFrom(combineLatest(inputValue$, attr$)),
    tag("submit$ w/ inputValue$"),
    switchMap(([_, e164]) => submitPhone$({ e164 })),
    tag("result$"),
    share()
  )

  const isLoading$ = of(false)
  const isValid$ = inputValue$.pipe(
    // TODO: validation?
    map((_) => false),
    startWith(false),
    tag("isValid"),
    share()
  )

  const $props = attr$.pipe(
    map((attr) => {
      return {}
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
