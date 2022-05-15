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
    props: { e164$: _e164$ },
  } = sources
  const e164$ = _e164$.pipe(startWith(""), share())
  const [code$, onChangeCodeInput] = makeObservableCallback<VerificationCode>()
  const [submit$, onSubmit] = makeObservableCallback()
  const onComplete = (code: string) => onSubmit()

  // TODO: ¿canonical location to specify verification code length?
  const validCodeLength = 4
  const codeIsValid$ = code$.pipe(
    map((code) => code.length === validCodeLength),
    startWith(false),
    tag("codeIsValid$"),
    shareReplay()
  )
  const codeIsInvalid$ = codeIsValid$.pipe(
    map(not),
    tag("codeIsInvalid$"),
    shareReplay()
  )

  const result$ = submit$.pipe(
    tag("submit$"),
    withLatestFrom(
      combineLatest({ e164: e164$, code: code$ }).pipe(
        tag("e164$, code$"),
        share()
      )
    ),
    switchMap(([_, input]) => verifyCode$(input)),
    tag("verifyCode$"),
    share()
  )

  const isLoading$ = merge(
    submit$.pipe(map((_) => true)),
    result$.pipe(map((_) => false))
  ).pipe(startWith(false), tag("isLoading$"), shareReplay())

  const isDisabledCodeInput$ = isLoading$
  const isDisabledSubmitButton$ = combineLatest({
    isLoading: isLoading$,
    codeIsInvalid: codeIsInvalid$,
  }).pipe(
    map(({ isLoading, codeIsInvalid }) => isLoading || codeIsInvalid),
    tag("loading$ || invalid$"),
    share()
  )

  const react = combineLatest({
    e164: e164$,
    isLoading: isLoading$,
    isDisabledCodeInput: isDisabledCodeInput$,
    isDisabledSubmitButton: isDisabledSubmitButton$,
  }).pipe(
    map(({ e164, isLoading, isDisabledCodeInput, isDisabledSubmitButton }) => {
      return h(View, {
        onSubmit,
        onComplete,
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
