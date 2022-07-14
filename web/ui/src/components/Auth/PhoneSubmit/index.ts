import { h, ReactSource } from "@cycle/react"
import { phone as validatePhone } from "phone"
import {
  combineLatest,
  filter,
  map,
  merge,
  Observable,
  share,
  shareReplay,
  startWith,
  switchMap,
  withLatestFrom,
} from "rxjs"
import { not } from "~/fp"
import {
  submitPhone$,
  UserError,
  Verification,
  VerificationStatus,
} from "~/graph"
import { makeTagger } from "~/log"
import { error } from "~/notice"
import { makeObservableCallback, shareLatest } from "~/rx"
import { View } from "./View"

export { View }

// @ts-ignore
const { VITE_API_ENV } = import.meta.env
const strictDetection = VITE_API_ENV === "prod"
const validateMobilePrefix = strictDetection

const tag = makeTagger("PhoneSubmit")

interface Sources {
  react: ReactSource
}
export const PhoneSubmit = ({ ...sources }: Sources) => {
  const { $: _phoneInput$, cb: onChangePhoneInput } =
    makeObservableCallback<string>()
  const phoneInput$ = _phoneInput$.pipe(tag("phoneInput$"), shareLatest())

  const phoneValidation$ = phoneInput$.pipe(
    map((phone) =>
      validatePhone(phone, {
        country: "USA",
        strictDetection,
        validateMobilePrefix,
      })
    ),
    tag("phoneValidation$"),
    share()
  )
  const e164$: Observable<string> = phoneValidation$.pipe(
    map(({ phoneNumber }) => phoneNumber || ""),
    startWith(""),
    tag("e164$"),
    shareLatest() // TODO: subscribe from outer component to preserve across views -> share()
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

  const { $: _submit$, cb: onSubmit } = makeObservableCallback()
  const submit$ = _submit$.pipe(tag("submit$"), share())

  const result$ = submit$.pipe(
    withLatestFrom(e164$),
    tag("submit$ w/ e164$"),
    switchMap(([_, e164]) => submitPhone$({ e164 })),
    tag("result$"),
    share()
  )

  const userError$ = result$.pipe(
    filter((result): result is UserError => result.__typename === "UserError")
  )
  const verification$ = result$.pipe(
    filter(
      (result): result is Verification => result.__typename === "Verification"
    )
  )
  const verificationStatus$ = verification$.pipe(
    map((v) => v.status),
    tag("verificationStatus$")
  )
  const pending$ = verificationStatus$.pipe(
    filter((status) => status === VerificationStatus.Pending)
  )
  const cancelled$ = verificationStatus$.pipe(
    filter((status) => status === VerificationStatus.Canceled)
  )

  const isLoading$ = merge(
    submit$.pipe(map((_) => true)),
    result$.pipe(map((_) => false))
  ).pipe(startWith(false), tag("isLoading$"), shareLatest())

  const isPhoneInputDisabled$ = isLoading$.pipe(tag("isPhoneInputDisabled$"))

  const isSubmitButtonDisabled$ = combineLatest({
    invalid: isPhoneInvalid$,
    loading: isLoading$,
  }).pipe(
    map(({ invalid, loading }) => invalid || loading),
    startWith(true),
    tag("isSubmitButtonDisabled$"),
    share()
  )

  const react = combineLatest({
    isLoading: isLoading$,
    isSubmitButtonDisabled: isSubmitButtonDisabled$,
    isPhoneInputDisabled: isPhoneInputDisabled$,
  }).pipe(
    map((props) => h(View, { ...props, onSubmit, onChangePhoneInput })),
    tag("react")
  )

  const notice = userError$.pipe(
    map(({ message }) => error({ description: message }))
  )

  const value = {
    e164$,
    verificationStatus$,
  }

  return {
    react,
    notice,
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
