import { h, ReactSource } from "@cycle/react"
import { not } from "ramda"
import {
  combineLatest,
  map,
  Observable,
  of,
  switchMap,
  withLatestFrom,
} from "rxjs"
import { tag } from "~/log"

import { makeObservableCallback } from "~/rx"
import { View } from "./View"

type VerificationCode = string

interface Props {
  e164$: Observable<string>
}

interface Sources {
  react: ReactSource
  props: Props
}
export const PhoneVerify = (sources: Sources) => {
  const {
    props: { e164$ },
  } = sources
  const [code$, onChangeCodeInput] = makeObservableCallback<VerificationCode>()
  const [submit$, onSubmit] = makeObservableCallback()

  const validCodeLength = 6
  const codeIsValid$ = code$.pipe(
    map((code) => code.length === validCodeLength)
  )

  const result$ = submit$.pipe(
    withLatestFrom(combineLatest({ e164: e164$, code: code$ })),
    switchMap(([_, pair]) => {
      const { code, e164 } = pair
      return of(pair)
    }),
    tag("verifyCode$")
  )

  const isLoading$ = of(false)
  // const isLoading$ = merge(
  //   submit$.pipe(map((_) => true)),
  //   result$.pipe(map((_) => false))
  // ).pipe(startWith(false))

  const isDisabledCodeInput$ = of(false)
  // const isDisabledSubmitButton = combineLatest({
  //   invalid: isPhoneInvalid$,
  //   loading: isLoading$,
  // }).pipe(
  //   map(({ invalid, loading }) => invalid || loading),
  //   share()
  // )

  const isDisabledSubmitButton$ = of(false)
  // const isDisabledSubmitButton = codeIsValid.pipe(map(not))

  // const react = of(h(View))
  const react = combineLatest({
    e164: e164$,
    isLoading: isLoading$,
    isDisabledCodeInput: isDisabledCodeInput$,
    isDisabledSubmitButton: isDisabledSubmitButton$,
  }).pipe(
    map(({ e164, isLoading, isDisabledCodeInput, isDisabledSubmitButton }) => {
      return h(View, {
        onSubmit,
        onChangeCodeInput,
        e164,
        isLoading,
        isDisabledCodeInput,
        isDisabledSubmitButton,
      })
    })
  )

  return {
    react,
  }
}
