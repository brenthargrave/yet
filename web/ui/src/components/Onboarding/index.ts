import { h, ReactSource } from "@cycle/react"
import { snakeCase } from "change-case"
import { createRef } from "react"
import { pluck } from "ramda"
import {
  combineLatest,
  distinctUntilChanged,
  filter,
  map,
  merge,
  mergeMap,
  share,
  startWith,
  switchMap,
  tap,
  withLatestFrom,
} from "rxjs"
import { isNotNullish } from "rxjs-etc"
import { filterResultErr, filterResultOk } from "ts-results/rxjs-operators"
import { AuthService } from "~/components/App/AuthService"
import { isEmpty, trim } from "~/fp"
import {
  AuthProvider,
  EventName,
  firstRequiredProfileProp,
  FromView,
  nextRequiredProfileProp,
  patchProfile$,
  ProfileProp,
  Source as GraphSource,
  track$,
} from "~/graph"
import { t } from "~/i18n"
import { makeTagger } from "~/log"
import { cb$, noticeFromError$, shareLatest } from "~/rx"
import { View } from "./View"

const inputRef = createRef<HTMLInputElement>()

interface Sources {
  react: ReactSource
  graph: GraphSource
}

export const Onboarding = (sources: Sources, tagPrefix?: string) => {
  const tagScope = `${tagPrefix}/Onboarding`
  const tag = makeTagger(tagScope)
  const {
    graph: { me$: _me$ },
  } = sources
  const me$ = _me$.pipe(filter(isNotNullish), tag("me$"), shareLatest())

  const attr$ = me$.pipe(
    map((me) => nextRequiredProfileProp(me)),
    startWith(firstRequiredProfileProp),
    filter(isNotNullish),
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
  }).pipe(tag("collected$"), shareLatest())

  const result$ = submit$.pipe(
    withLatestFrom(collected$),
    tag("submit$ w/ inputValue$"),
    switchMap(([_, { me, value, attr }]) =>
      patchProfile$({
        id: me.id,
        prop: attr,
        value,
      }).pipe(tag("patchProfile$"))
    ),
    tag("result$"),
    share()
  )
  const _ = result$.pipe(filterResultOk())
  const error$ = result$.pipe(filterResultErr(), tag("error$"))

  const trackStep$ = submit$.pipe(
    withLatestFrom(collected$),
    mergeMap(([_, { me, value, attr }]) => {
      return track$({
        customerId: me.id,
        name: EventName.UpdateProfile,
        properties: {
          profileProp: attr,
          view: FromView.Onboarding,
        },
      })
    })
  )

  const isLoading = merge(
    submit$.pipe(map((_) => true)),
    result$.pipe(map((_) => false))
  ).pipe(startWith(false), tag("isLoading$"), shareLatest())

  const isInputInvalid = combineLatest({
    value: inputValue$,
    attr: attr$,
  }).pipe(
    map(({ value, attr }) => {
      if (attr === ProfileProp.Email) return isEmpty(value.match(/\S+@\S+/))
      return trim(value).length < 2
    }),
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

  const twitter = AuthService(
    sources,
    {
      provider: AuthProvider.Twitter,
      from: FromView.Onboarding,
    },
    tagScope
  )
  const facebook = AuthService(
    sources,
    {
      provider: AuthProvider.Facebook,
      from: FromView.Onboarding,
    },
    tagScope
  )
  const authPending = merge(
    twitter.value.authPending,
    facebook.value.authPending
  )

  const react = combineLatest({
    attr: attr$,
    isSubmitButtonDisabled,
    isInputDisabled,
    isLoading,
    authPending,
  }).pipe(
    map(({ attr, ...props }) => {
      const key = snakeCase(attr)
      return h(View, {
        attr,
        ...props,
        onChangeInput,
        onSubmit,
        headingCopy: t(`onboarding.${key}.headingCopy`),
        inputPlaceholder: t(`onboarding.${key}.inputPlaceholer`),
        submitButtonCopy: t(`onboarding.${key}.submitButtonCopy`),
        inputRef,
        onClickAuthTwitter: twitter.value.onClickAuth,
        onClickAuthFacebook: facebook.value.onClickAuth,
      })
    }),
    tap(() => {
      setTimeout(() => {
        inputRef.current?.focus()
      }, 300)
    }),
    tag("react")
  )

  const notice = noticeFromError$(error$)
  const track = merge(...pluck("track", [twitter, facebook]), trackStep$)

  return {
    react,
    notice,
    track,
  }
}
