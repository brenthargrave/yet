import { h, ReactSource } from "@cycle/react"
import { useState } from "react"
import phone, { phone as validatePhone } from "phone"
import { useEffectOnce } from "react-use"

import {
  Subject,
  BehaviorSubject,
  combineLatest,
  map,
  of,
  Observable,
  switchMap,
  shareReplay,
  startWith,
} from "rxjs"
import { View } from "./View"
import { Context } from "~/context"
import { signin, VerificationStatus } from "~/graph"
// import { Notify } from "~/components/App/View"
import { routes } from "~/router"

type ObservableCallback<O> = [Observable<O>, (t?: any) => void]
function makeObservableCallback<T>(): ObservableCallback<T> {
  const subject = new Subject<T>()
  const observable = subject.asObservable()
  const callback = (i: T) => {
    subject.next(i)
  }
  return [observable, callback]
}

interface Sources {
  react: ReactSource
}
export const PhoneSubmit = (sources: Sources) => {
  const [phoneInput$, onChangePhoneInput] = makeObservableCallback<string>()

  const phoneValidation$ = phoneInput$.pipe(
    map((phone) =>
      validatePhone(phone, {
        country: "USA",
        strictDetection: true,
      })
    ),
    shareReplay()
  )
  const phone$ = phoneValidation$.pipe(map(({ phoneNumber }) => phoneNumber))
  const isPhoneValid$ = phoneValidation$.pipe(
    map(({ isValid }) => isValid),
    startWith(false)
  )
  // TODO: operator: not()
  const isPhoneInvalid$ = isPhoneValid$.pipe(map((valid) => !valid))

  // TODO: loading == request in flight
  const [submit$, onSubmit] = makeObservableCallback()
  // states: loading, result | error

  const isLoading$ = new BehaviorSubject<boolean>(false) // loading, start false

  // TODO: disabled while loading
  const isSubmitButtonDisabled$ = isPhoneInvalid$
  const isPhoneInputDisabled$ = new BehaviorSubject<boolean>(false)

  const react = combineLatest({
    isLoading: isLoading$,
    isSubmitButtonDisabled: isSubmitButtonDisabled$,
    isPhoneInputDisabled: isPhoneInputDisabled$,
  }).pipe(map((props) => h(View, { ...props, onSubmit, onChangePhoneInput })))

  return {
    react,
  }
}

interface Props {
  context: Context
  // notify: Notify
}
export const PhoneSubmitHooks = ({ context }: Props) => {
  const [e164, setE164] = useState("")
  const [isButtonDisabled, setButtonDisabled] = useState<boolean>(true)
  const [isInputDisabled, setInputDisabled] = useState<boolean>(false)
  const [isLoading, setLoading] = useState(false)

  useEffectOnce(() => {
    // TODO: track("viewed submit phone")
  })

  const onChangePhoneInput = () => null
  const _onChangePhone = (phone: string) => {
    const { isValid, phoneNumber } = validatePhone(phone, {
      country: "USA",
      strictDetection: true,
    })
    setButtonDisabled(!isValid || isLoading)
    if (isValid && !!phoneNumber) {
      setE164(phoneNumber)
    }
  }

  const onSubmit = () => null
  const _onSubmit: React.FormEventHandler<HTMLButtonElement> = async (
    event
  ) => {
    event.preventDefault()
    // TODO: track("submitted phone number")
    setLoading(true)
    setButtonDisabled(true)
    setInputDisabled(true)
    const result = await signin({ e164 })
    switch (result.__typename) {
      case "VerificationError": {
        // TODO: notify({ status: "error", title: result.message })
        break
      }
      case "Verification":
        console.debug(result.status)
        switch (result.status) {
          case VerificationStatus.Canceled:
            // TODO
            // notify({
            //   title: "Verification cancelled, please try again.",
            //   status: "warning",
            // })
            break
          case VerificationStatus.Pending:
            // TODO: track("viewed verify phone")
            routes.verify().push()
            break
          case VerificationStatus.Approved:
            // TODO: skip verify, *MUST* be auth token, so route home
            break
        }
        break
    }
    setInputDisabled(false)
    setButtonDisabled(false)
    setLoading(false)
  }

  return h(View, {
    onChangePhoneInput,
    isSubmitButtonDisabled: isButtonDisabled,
    isPhoneInputDisabled: isInputDisabled,
    onSubmit,
    isLoading,
  })
}
