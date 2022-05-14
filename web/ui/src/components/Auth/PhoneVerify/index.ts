import { h, ReactSource } from "@cycle/react"
import { not } from "ramda"
import {
  combineLatest,
  map,
  Observable,
  of,
  switchMap,
  withLatestFrom,
  merge,
  startWith,
  share,
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
    props: { e164$: _e164$ },
  } = sources
  const e164$ = _e164$.pipe(startWith(""), share())
  const [code$, onChangeCodeInput] = makeObservableCallback<VerificationCode>()
  const [submit$, onSubmit] = makeObservableCallback()

  const validCodeLength = 6
  const codeIsValid$ = code$.pipe(
    map((code) => code.length === validCodeLength),
    startWith(false)
  )
  const codeIsInvalid$ = codeIsValid$.pipe(map(not))

  const result$ = submit$.pipe(
    withLatestFrom(combineLatest({ e164: e164$, code: code$ })),
    switchMap(([_, pair]) => {
      const { code, e164 } = pair
      return of(pair)
    }),
    tag("verifyCode$")
  )

  const isLoading$ = merge(
    submit$.pipe(map((_) => true)),
    result$.pipe(map((_) => false))
  ).pipe(startWith(false))

  const isDisabledCodeInput$ = codeIsInvalid$
  const isDisabledSubmitButton$ = combineLatest({
    isLoading: isLoading$,
    codeIsInvalid: codeIsInvalid$,
  }).pipe(map(({ isLoading, codeIsInvalid }) => isLoading || codeIsInvalid))

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
