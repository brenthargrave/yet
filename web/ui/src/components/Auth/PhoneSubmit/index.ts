import { h, ReactSource } from "@cycle/react"
import { useState } from "react"
import { phone as validatePhone } from "phone"
import { useEffectOnce } from "react-use"

import {
  Subject,
  BehaviorSubject,
  combineLatest,
  map,
  of,
  Observable,
} from "rxjs"
import { View } from "./View"
import { Context } from "~/context"
import { signin, VerificationStatus } from "~/graph"
// import { Notify } from "~/components/App/View"
import { routes } from "~/router"

interface ObserveCallback<O> {
  observable: Observable<O>
  callback: (t?: any) => void
}
function observeCallback<T>(): ObserveCallback<T> {
  const subject = new Subject<T>()
  const observable = subject.asObservable()
  const callback = (i: T) => {
    subject.next(i)
  }
  return { observable, callback }
}

interface Sources {
  react: ReactSource
}
export const PhoneSubmit = (sources: Sources) => {
  const onChangePhoneInput = (t: string) => console.debug(t)
  const { observable: submit$, callback: onSubmit } = observeCallback()
  const isLoading$ = new BehaviorSubject<boolean>(false)
  const isSubmitButtonDisabled$ = new BehaviorSubject<boolean>(true)
  const isPhoneInputDisabled$ = new BehaviorSubject<boolean>(false)

  const react = combineLatest({
    isLoading: isLoading$,
    isSubmitButtonDisabled: isSubmitButtonDisabled$,
    isPhoneInputDisabled: isPhoneInputDisabled$,
  }).pipe(map((props) => h(View, { ...props, onSubmit, onChangePhoneInput })))

  // TODO: where/how subscribe to event callbacks? in cycle, you observe react
  // source; there's no need to subscribe/send to a distinct sink, it's part of teh react
  // sink

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
