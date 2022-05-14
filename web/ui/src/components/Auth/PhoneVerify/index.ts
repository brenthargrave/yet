import { h, ReactSource } from "@cycle/react"
import { not } from "ramda"
import { combineLatest, map, Observable, of } from "rxjs"
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
  const [code, onChangeCodeInput] = makeObservableCallback<VerificationCode>()
  const [submit$, onSubmit] = makeObservableCallback()

  const validCodeLength = 6 // TODO: where set?
  const codeIsValid = code.pipe(map((code) => code.length === validCodeLength))

  // TODO: get initial verification step working e2e, or finish UI?
  // won't know waht result states are possible without complete endpoint.

  const isLoading = of(false)
  const isDisabledSubmitButton = codeIsValid.pipe(map(not)) // TODO: isLoading
  const isDisabledCodeInput = isLoading

  // const react = of(h(View))
  const react = combineLatest({
    e164: e164$,
  }).pipe(
    map(({ e164 }) => {
      return h(View, {
        e164,
        isDisabledSubmitButton,
      })
    })
  )

  return {
    react,
  }
}
