import { h, ReactSource } from "@cycle/react"
import { not } from "ramda"
import {
  combineLatest,
  map,
  Observable,
  switchMap,
  withLatestFrom,
  merge,
  startWith,
  shareReplay,
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
    props: { e164$ },
  } = sources
  const [_code$, onChangeCodeInput] = makeObservableCallback<VerificationCode>()
  const code$ = _code$.pipe(
    tag("code$"),
    shareReplay({ refCount: true, bufferSize: 1 })
  )
  const [submit$, onSubmit] = makeObservableCallback()
  const onComplete = (code: string) => onSubmit()

  // TODO: ¿canonical location to specify verification code length?
  const validCodeLength = 4
  const codeIsValid$ = code$.pipe(
    map((code) => code.length === validCodeLength),
    startWith(false),
    tag("codeIsValid$")
  )
  const codeIsInvalid$ = codeIsValid$.pipe(map(not), tag("codeIsInvalid$"))

  const result$ = submit$.pipe(
    tag("submit$"),
    withLatestFrom(combineLatest({ e164: e164$, code: code$ })),
    tag("e164$, code$"),
    switchMap(([_, input]) => verifyCode$(input)),
    tag("verifyCode$")
  )
  // TODO: handle response!

  const isLoading$ = merge(
    submit$.pipe(map((_) => true)),
    result$.pipe(map((_) => false))
  ).pipe(startWith(false), tag("isLoading$"))

  const isDisabledCodeInput$ = isLoading$
  const isDisabledSubmitButton$ = combineLatest({
    isLoading: isLoading$,
    codeIsInvalid: codeIsInvalid$,
  }).pipe(
    map(({ isLoading, codeIsInvalid }) => isLoading || codeIsInvalid),
    tag("loading$ || invalid$")
  )

  const react = combineLatest({
    e164: e164$,
    isLoading: isLoading$,
    isDisabledCodeInput: isDisabledCodeInput$,
    isDisabledSubmitButton: isDisabledSubmitButton$,
  }).pipe(
    map((props) => {
      return h(View, {
        ...props,
        onSubmit,
        onComplete,
        onChangeCodeInput,
      })
    })
  )

  return {
    react,
  }
}
