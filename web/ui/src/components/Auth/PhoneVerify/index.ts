import { h, ReactSource } from "@cycle/react"
import { code } from "@cycle/react-dom"
import { combineLatest, Observable, of } from "rxjs"
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
  // const { props: props$ } = sources
  const [code$, onChangeCodeInput] = makeObservableCallback<VerificationCode>()
  const [submit$, onSubmit] = makeObservableCallback()

  const isDisabledSubmitButton = of(false)
  const isDisabledCodeInput = of(false)
  const isLoading = of(false)

  combineLatest({
    // props: props$, // e164: string
    code: code$,
  })

  const react = of(h(View))
  // setDisabledButton(value.length !== codeLength)
  return {
    react,
  }
}
