import { h, ReactSource } from "@cycle/react"
import { useState } from "react"
import { phone as validatePhone } from "phone"
import { useEffectOnce } from "react-use"
import {
  Observable,
  combineLatest,
  map,
  merge,
  share,
  shareReplay,
  startWith,
  switchMap,
  tap,
  withLatestFrom,
} from "rxjs"
import { isNotNullish } from "rxjs-etc"
import { not } from "ramda"
import { match } from "ts-pattern"

import { View } from "./View"
import { Verification, VerificationStatus, verifyPhone$ } from "~/graph"
import { routes } from "~/router"
import { tag } from "~/log"
import { makeObservableCallback } from "~/rx"
import { toast } from "~/toast"

export { View }

// @ts-ignore
const { VITE_API_ENV } = import.meta.env
const strictDetection = VITE_API_ENV === "prod"
const validateMobilePrefix = strictDetection

export interface Props {
  onVerificationPending: () => void
}

interface Sources {
  react: ReactSource
  props: Props
}
export const PhoneSubmit = ({ props, ...sources }: Sources) => {
  const { onVerificationPending } = props
  const [_phoneInput$, onChangePhoneInput] = makeObservableCallback<string>()
  const phoneInput$ = _phoneInput$.pipe(
    tag("phoneInput$"),
    shareReplay({ refCount: true, bufferSize: 1 })
  )

  const phoneValidation$ = phoneInput$.pipe(
    map((phone) =>
      validatePhone(phone, {
        country: "USA",
        strictDetection,
        validateMobilePrefix,
      })
    ),
    tag("phoneValidation$")
  )
  const e164$: Observable<string> = phoneValidation$.pipe(
    map(({ phoneNumber }) => phoneNumber || ""),
    startWith(""),
    tag("e164$"),
    share()
  )
  const isPhoneValid$ = phoneValidation$.pipe(
    map(({ isValid }) => isValid),
    startWith(false),
    tag("isPhoneValid$")
  )
  const isPhoneInvalid$ = isPhoneValid$.pipe(
    map(not),
    tag("isPhoneInvalid$"),
    share()
  )

  const [submit$, onSubmit] = makeObservableCallback()

  // const res$: Observable<Verification | VerificationError> = result$.pipe(
  //   filter(isNotNullish)
  // )
  // const verification$: Observable<Verification> = res$.pipe(
  //   filter((res): res is Verification => res.__typename === "Verification")
  // )
  const result$ = submit$.pipe(
    withLatestFrom(e164$),
    tag("submit$ w/ e164$"),
    switchMap(([_, e164]) => verifyPhone$({ e164 })),
    tap((result) => {
      match(result)
        .with({ __typename: "Verification" }, (result) => {
          match(result.status)
            .with(VerificationStatus.Pending, () => {
              // TODO: -> result$ { verificationStatus }
              onVerificationPending()
            })
            .with(VerificationStatus.Approved, () => {
              // TODO: extract/lift up into parent: Auth
              routes.home().push()
            })
            .with(VerificationStatus.Canceled, () => {
              toast({
                title: "Oops!",
                description: "Phone verification cancelled",
                status: "error",
              })
            })
            .exhaustive()
        })
        .with({ __typename: "UserError" }, ({ message }) => {
          console.error(message)
          toast({
            title: "Please try again.",
            description: message,
            status: "error",
          })
        })
        .with({ __typename: "Error" }, ({ message }) => {
          console.error(message)
          toast({
            title: "Oops!",
            description: message,
            status: "error",
          })
        })
        .run()
    }),
    tag("result$"),
    share()
  )

  const isLoading$ = merge(
    submit$.pipe(map((_) => true)),
    result$.pipe(map((_) => false))
  ).pipe(startWith(false), tag("isLoading$"))

  const isSubmitButtonDisabled$ = combineLatest({
    invalid: isPhoneInvalid$,
    loading: isLoading$,
  }).pipe(map(({ invalid, loading }) => invalid || loading))
  const isPhoneInputDisabled$ = isLoading$.pipe(tag("isPhoneInputDisabled$"))

  const react = combineLatest({
    isLoading: isLoading$,
    isSubmitButtonDisabled: isSubmitButtonDisabled$,
    isPhoneInputDisabled: isPhoneInputDisabled$,
  }).pipe(
    map((props) => h(View, { ...props, onSubmit, onChangePhoneInput })),
    tag("PhoneSubmit.react")
  )

  const value = {
    e164$,
  }

  return {
    react,
    value,
  }
}

// interface Props {
//   context: Context
//   // notify: Notify
// }
// export const PhoneSubmitHooks = ({ context }: Props) => {
//   const [e164, setE164] = useState("")
//   const [isButtonDisabled, setButtonDisabled] = useState<boolean>(true)
//   const [isInputDisabled, setInputDisabled] = useState<boolean>(false)
//   const [isLoading, setLoading] = useState(false)

//   const onChangePhoneInput = (phone: string) => {
//     const { isValid, phoneNumber } = validatePhone(phone, {
//       country: "USA",
//       strictDetection: true,
//     })
//     setButtonDisabled(!isValid || isLoading)
//     if (isValid && !!phoneNumber) {
//       setE164(phoneNumber)
//     }
//   }

//   const onSubmit = async () => {
//     setLoading(true)
//     setButtonDisabled(true)
//     setInputDisabled(true)
//     const result = await signin({ e164 })
//     setInputDisabled(false)
//     setButtonDisabled(false)
//     setLoading(false)
//     match(result)
//       .with({ __typename: "VerificationError" }, ({ message }) =>
//         toast({
//           status: "error",
//           title: "Verification Failed",
//           description: message,
//         })
//       )
//       .with({ __typename: "Verification" }, (result) => {
//         match(result.status)
//           .with(VerificationStatus.Canceled, () => {
//             toast({
//               status: "error",
//               title: "Verification cancelled",
//               description: "Please try again",
//             })
//           })
//           .with(VerificationStatus.Approved, () => {
//             // NOTE: when/why this would happen?
//             routes.home().push()
//           })
//           .with(VerificationStatus.Pending, () => {
//             // TODO: what happens when verification pendign?
//             // next view, but we need state somehow
//             routes.verify().push()
//           })
//           .exhaustive()
//       })
//   }

//   return h(View, {
//     onChangePhoneInput,
//     isSubmitButtonDisabled: isButtonDisabled,
//     isPhoneInputDisabled: isInputDisabled,
//     onSubmit,
//     isLoading,
//   })
// }
