import { h, ReactSource } from "@cycle/react"
import {
  BehaviorSubject,
  combineLatest,
  filter,
  map,
  merge,
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
import { Source as GraphSource, updateProfile$ } from "~/graph"
import { View } from "./View"
import { makeObservableCallback } from "~/rx"
import { makeTagger } from "~/log"

const tag = makeTagger("Onboarding")

interface Sources {
  react: ReactSource
  graph: GraphSource
}

const attributes = ["name", "org", "role"]

export const Onboarding = ({ graph: { me$: _me$ } }: Sources) => {
  const value$$ = new BehaviorSubject<string>("")
  const inputValue$ = value$$
    .asObservable()
    .pipe(tag("inputValue$"), shareReplay())
  const onChangeInput = (value: string) => value$$.next(value)

  const [_submit$, onSubmit] = makeObservableCallback<void>()
  const submit$ = _submit$.pipe(tag("submit$"), share())

  const me$ = _me$.pipe(filter(isNotNullish), tag("me$"), share())
  const attr$ = me$.pipe(
    map((me) => find((attr) => propSatisfies(isNil, attr, me), attributes)),
    filter(isNotNullish),
    tag("state$")
  )

  const result$ = submit$.pipe(
    withLatestFrom(combineLatest({ me: me$, value: inputValue$, attr: attr$ })),
    tag("submit$ w/ inputValue$"),
    switchMap(([_, { me, value, attr }]) =>
      updateProfile$({
        id: me?.id,
        [attr]: value,
      })
    ),
    tag("result$"),
    share()
  )

  const isLoading$ = merge(
    submit$.pipe(map((_) => true)),
    result$.pipe(map((_) => false))
  ).pipe(
    startWith(false),
    tag("isLoading$"),
    shareReplay({ refCount: true, bufferSize: 1 })
  )

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
