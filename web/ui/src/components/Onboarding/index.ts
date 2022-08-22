import { h, ReactSource } from "@cycle/react"
import { createRef } from "react"
import {
  BehaviorSubject,
  combineLatest,
  distinctUntilChanged,
  filter,
  map,
  merge,
  share,
  startWith,
  switchMap,
  tap,
  withLatestFrom,
} from "rxjs"
import { isNotNullish } from "rxjs-etc"
import { filterResultErr, filterResultOk } from "ts-results/rxjs-operators"
import { find, isNil, prop, propSatisfies, toLower, trim } from "~/fp"
import { ProfileProp, Source as GraphSource, updateProfile$ } from "~/graph"
import { t } from "~/i18n"
import { makeTagger } from "~/log"
import { error } from "~/notice"
import { cb$, shareLatest } from "~/rx"
import { View } from "./View"

const tag = makeTagger("Onboarding")

const inputRef = createRef<HTMLInputElement>()

interface Sources {
  react: ReactSource
  graph: GraphSource
}

const attributes = [ProfileProp.Name, ProfileProp.Org, ProfileProp.Role]

export const Onboarding = ({ graph: { me$: _me$ } }: Sources) => {
  const me$ = _me$.pipe(filter(isNotNullish), tag("me$"), shareLatest())

  const attr$ = me$.pipe(
    map((me) =>
      find((attr) => propSatisfies(isNil, toLower(attr), me), attributes)
    ),
    filter(isNotNullish),
    startWith(prop(0, attributes)),
    distinctUntilChanged(),
    tag("attr$"),
    shareLatest()
  )

  const [onChangeInput, onChangeInput$] = cb$<string>(tag("onChangeInput$"))
  const inputValue$ = onChangeInput$.pipe(tag("inputValue$"), shareLatest())

  const [onSubmit, submit$] = cb$(tag("submit$"))

  const collected$ = combineLatest({
    me: me$,
    value: inputValue$,
    attr: attr$,
  }).pipe(tag("collected$"))

  const result$ = submit$.pipe(
    withLatestFrom(collected$),
    tag("submit$ w/ inputValue$"),
    switchMap(([_, { me, value, attr }]) =>
      updateProfile$({
        id: me.id,
        prop: attr,
        value,
      }).pipe(tag("updateProfile$"))
    ),
    tag("result$"),
    share()
  )
  const _$ = result$.pipe(filterResultOk())
  const userError$ = result$.pipe(filterResultErr(), tag("userError$"))

  const isLoading = merge(
    submit$.pipe(map((_) => true)),
    result$.pipe(map((_) => false))
  ).pipe(startWith(false), tag("isLoading$"), shareLatest())

  const isInputInvalid = inputValue$.pipe(
    map((value) => trim(value).length < 2),
    startWith(true),
    tag("isInputInvalid"),
    shareLatest()
  )

  const isInputDisabled = isLoading.pipe(tag("isInputDisabled$"), share())
  const isSubmitButtonDisabled = combineLatest({
    isLoading,
    isInputInvalid,
  }).pipe(
    map(({ isLoading, isInputInvalid }) => isLoading || isInputInvalid),
    startWith(true),
    tag("isSubmitButtonDisabled$"),
    shareLatest()
  )

  const react = combineLatest({
    attr: attr$,
    isSubmitButtonDisabled,
    isInputDisabled,
    isLoading,
  }).pipe(
    map(({ attr, ...props }) => {
      const key = toLower(attr)
      return h(View, {
        attr,
        ...props,
        onChangeInput,
        onSubmit,
        headingCopy: t(`onboarding.${key}.headingCopy`),
        inputPlaceholder: t(`onboarding.${key}.inputPlaceholer`),
        submitButtonCopy: t(`onboarding.${key}.submitButtonCopy`),
        inputRef,
      })
    }),
    tap(() => {
      setTimeout(() => {
        inputRef.current?.focus()
      }, 300)
    }),
    tag("react")
  )

  const notice = userError$.pipe(
    map(({ message }) => error({ description: message })),
    tag("notice")
  )

  return {
    react,
    notice,
  }
}
