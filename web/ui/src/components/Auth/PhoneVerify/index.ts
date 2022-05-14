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
import { verifyCode$ } from "~/graph"
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

  const validCodeLength = 4
  const codeIsValid$ = code$.pipe(
    tag("code$"),
    map((code) => code.length === validCodeLength),
    startWith(false)
  )
  const codeIsInvalid$ = codeIsValid$.pipe(map(not))

  const result$ = submit$.pipe(
    withLatestFrom(combineLatest({ e164: e164$, code: code$ })),
    switchMap(([_, input]) => verifyCode$(input)),
    tag("verifyCode$")
  )

  const isLoading$ = merge(
    submit$.pipe(map((_) => true)),
    result$.pipe(map((_) => false))
  ).pipe(startWith(false))

  const isDisabledCodeInput$ = isLoading$
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
