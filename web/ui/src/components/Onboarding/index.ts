import { h, ReactSource } from "@cycle/react"
import {
  BehaviorSubject,
  catchError,
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
  tap,
  withLatestFrom,
} from "rxjs"
import { find, has, isNil, prop, propSatisfies, toLower } from "ramda"
import { isNotNullish } from "rxjs-etc"
import { t } from "~/i18n"
import {
  Source as GraphSource,
  updateProfile$,
  UserError,
  ProfileProp,
} from "~/graph"
import { View } from "./View"
import { makeObservableCallback } from "~/rx"
import { makeTagger } from "~/log"
import { error } from "~/notice"

const tag = makeTagger("Onboarding")

interface Sources {
  react: ReactSource
  graph: GraphSource
}

// const attributes = ["name", "org", "role"]
const attributes = [ProfileProp.Name, ProfileProp.Org, ProfileProp.Role]

export const Onboarding = ({ graph: { me$: _me$ } }: Sources) => {
  const inputValue$$ = new BehaviorSubject<string>("")
  const inputValue$ = inputValue$$
    .asObservable()
    .pipe(tag("inputValue$"), shareReplay())
  const onChangeInput = (value: string) => inputValue$$.next(value)

  const [_submit$, onSubmit] = makeObservableCallback<void>()
  const submit$ = _submit$.pipe(tag("submit$"), share())

  const me$ = _me$.pipe(
    filter(isNotNullish),
    tag("me$"),
    shareReplay({ bufferSize: 1, refCount: true })
  )
  const attr$ = me$.pipe(
    map((me) => find((attr) => propSatisfies(isNil, attr, me), attributes)),
    filter(isNotNullish),
    startWith(prop(0, attributes)),
    distinctUntilChanged(),
    tag("attr$"),
    shareReplay({ bufferSize: 1, refCount: true })
  )

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

  const userError$ = result$.pipe(
    filter((result): result is UserError => result.__typename === "UserError"),
    tap((_) => inputValue$$.next("")),
    tag("userError$")
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
      })
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
