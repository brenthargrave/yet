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
import { withLatestFromWhen } from "rxjs-etc/dist/esm/operators"
import { tag } from "rxjs-spy/cjs/operators"
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

  // const isLoading$ = merge(
  //   submit$.pipe(map((_) => true)),
  //   result$.pipe(map((_) => false))
  // ).pipe(startWith(false))

  // const isDisabledSubmitButton = combineLatest({
  //   invalid: isPhoneInvalid$,
  //   loading: isLoading$,
  // }).pipe(
  //   map(({ invalid, loading }) => invalid || loading),
  //   share()
  // )
  // const isDisabledSubmitButton = codeIsValid.pipe(map(not))
  // const isDisabledCodeInput = isLoading

  // const react = of(h(View))
  const react = combineLatest({
    e164: e164$,
    // isDisabledSubmitButton,
  }).pipe(
    map(({ e164, isDisabledSubmitButton }) => {
      return h(View, {
        e164,
        // isDisabledCodeInput,
        // isDisabledSubmitButton,
        // isLoading,
        onSubmit,
        onChangeCodeInput,
      })
    })
  )

  return {
    react,
  }
}
