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
} from "rxjs"
import { not } from "ramda"
import { match } from "ts-pattern"

import { View } from "./View"
import { VerificationStatus, verifyPhone$ } from "~/graph"
import { routes } from "~/router"
import { tag } from "~/log"
import { makeObservableCallback } from "~/rx"
import { toast } from "~/toast"

export { View }

export interface Props {
  onVerificationPending: () => void
}

interface Sources {
  react: ReactSource
  props: Props
}
export const PhoneSubmit = ({ props, ...sources }: Sources) => {
  const { onVerificationPending } = props
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
  const e164$: Observable<string> = phoneValidation$.pipe(
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
    withLatestFrom(e164$),
    switchMap(([_, e164]) => verifyPhone$({ e164 })),
    tag("result"),
    tap((result) => {
      match(result)
        .with({ __typename: "Verification" }, (result) => {
          match(result.status)
            // TODO: sink:route
            .with(VerificationStatus.Pending, () => {
              // routes.verify().push()
              onVerificationPending()
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
