import { h, ReactSource } from "@cycle/react"
import {
  BehaviorSubject,
  combineLatest,
  distinctUntilChanged,
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
    .pipe(tag("inputValue$"), distinctUntilChanged(), shareReplay())
  const onChangeInput = (value: string) => value$$.next(value)

  const [_submit$, onSubmit] = makeObservableCallback<void>()
  const submit$ = _submit$.pipe(tag("submit$"), share())

  const me$ = _me$.pipe(filter(isNotNullish), tag("me$"), share())
  const attr$ = me$.pipe(
    map((me) => find((attr) => propSatisfies(isNil, attr, me), attributes)),
    filter(isNotNullish),
    distinctUntilChanged(),
    tag("attr$"),
    share()
  )

  const result$ = submit$.pipe(
    withLatestFrom(combineLatest({ me: me$, value: inputValue$, attr: attr$ })),
    tag("submit$ w/ inputValue$"),
    switchMap(([_, { me, value, attr }]) =>
      updateProfile$({
        id: me.id,
        [attr]: value,
      })
    ),
    tag("result$"),
    share()
  )

  const isLoading = merge(
    submit$.pipe(map((_) => true)),
    result$.pipe(map((_) => false))
  ).pipe(
    startWith(false),
    tag("isLoading$"),
    shareReplay({ refCount: true, bufferSize: 1 })
  )

  const isInputInvalid = inputValue$.pipe(
    // TODO: attr validation?
    map((_) => false),
    startWith(false),
    tag("isInputInvalid"),
    share()
  )

  const isInputDisabled = isLoading.pipe(tag("isInputDisabled$"), share())
  const isSubmitButtonDisabled = combineLatest({
    isLoading,
    isInputInvalid,
  }).pipe(
    map(({ isLoading, isInputInvalid }) => isLoading || isInputInvalid),
    startWith(false),
    tag("loading$ || invalid$"),
    share()
  )

  const react = combineLatest({
    attr: attr$,
    inputValue: inputValue$,
    isSubmitButtonDisabled,
    isInputDisabled,
    isLoading,
  }).pipe(
    map(({ attr, ...props }) =>
      h(View, {
        attr,
        ...props,
        onChangeInput,
        onSubmit,
        headingCopy: t(`onboarding.${attr}.headingCopy`),
        inputPlaceholder: t(`onboarding.${attr}.inputPlaceholer`),
        submitButtonCopy: t(`onboarding.${attr}.submitButtonCopy`),
      })
    ),
    tag("react")
  )

  return {
    react,
  }
}
