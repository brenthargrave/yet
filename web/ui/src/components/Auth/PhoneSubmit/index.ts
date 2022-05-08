import { h, ReactSource } from "@cycle/react"
import { useState } from "react"
import phone, { phone as validatePhone } from "phone"
import { useEffectOnce } from "react-use"
import {
  combineLatest,
  map,
  Observable,
  switchMap,
  shareReplay,
  startWith,
  withLatestFrom,
  share,
  tap,
  merge,
  filter,
} from "rxjs"
import { not } from "ramda"
import { match } from "ts-pattern"

import { View } from "./View"
import { Context } from "~/context"
import { signin, VerificationStatus, verifyPhone$ } from "~/graph"
import { routes } from "~/router"
import { tag } from "~/log"
import { makeObservableCallback } from "~/rx"
import { toast } from "~/toast"

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
  const phone$: Observable<string> = phoneValidation$.pipe(
    map(({ phoneNumber }) => phoneNumber || ""),
    tag("phone"),
    share()
  )
  const isPhoneValid$ = phoneValidation$.pipe(
    map(({ isValid }) => isValid),
    startWith(false)
  )
  const isPhoneInvalid$ = isPhoneValid$.pipe(map(not))

  const [submit$, onSubmit] = makeObservableCallback()

  // TODO: what am I stuck on? this code is awful, perhaps embedded errors
  // will be easier to work w/ than union result types.
  // recall now that JS requires tagged unions, only way to discrimiante, so
  // will always need to fitler off of a tag.
  const result$ = submit$.pipe(
    withLatestFrom(phone$),
    switchMap(([_, phone]) => verifyPhone$({ e164: phone })),
    tag("result"),
    tap((result) => {
      match(result)
        .with({ __typename: "Verification" }, (result) => {
          match(result.status)
            // TODO: sink:route
            .with(VerificationStatus.Pending, () => {
              routes.verify().push()
            })
            .with(VerificationStatus.Approved, () => routes.home().push())
            .with(VerificationStatus.Canceled, () => {
              toast({
                title: "Oops!",
                description: "Phone verification cancelled",
                status: "error",
              })
            })
            .exhaustive()
        })
        .with({ __typename: "VerificationError" }, ({ message }) =>
          // TODO: notification?
          console.error(message)
        )
        .run()
    }),
    share()
  )

  const isLoading$ = merge(
    submit$.pipe(map((_) => true)),
    result$.pipe(map((_) => false))
  ).pipe(startWith(false))

  const isSubmitButtonDisabled$ = combineLatest({
    invalid: isPhoneInvalid$,
    loading: isLoading$,
  }).pipe(
    map(({ invalid, loading }) => invalid || loading),
    share()
  )
  const isPhoneInputDisabled$ = isLoading$

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
