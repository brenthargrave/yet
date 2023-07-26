import { h, ReactSource } from "@cycle/react"
import { phone as validatePhone } from "phone"
import {
  combineLatest,
  filter,
  map,
  merge,
  mergeMap,
  share,
  startWith,
  switchMap,
  withLatestFrom,
} from "rxjs"
import { filterResultErr, filterResultOk } from "ts-results/rxjs-operators"
import { not } from "~/fp"
import { EventName, submitPhone$, track$, VerificationStatus } from "~/graph"
import { makeTagger } from "~/log"
import { cb$, noticeFromError$, shareLatest } from "~/rx"
import { COUNTRY_CODE_DEFAULT, View } from "./View"

export { View }

const { VITE_API_ENV } = import.meta.env
const strictDetection = VITE_API_ENV === "prod"
const validateMobilePrefix = strictDetection

interface Sources {
  react: ReactSource
}

export const PhoneSubmit = ({ ...sources }: Sources, tagPrefix?: string) => {
  const tagScope = `${tagPrefix}/PhoneSubmit`
  const tag = makeTagger(tagScope)

  const [onChangePhoneInput, phoneInput$] = cb$(tag("phoneINput$"))
  const [onChangeCountryCode, _countryCode$] = cb$<string>(tag("_countryCode$"))
  const countryCode$ = _countryCode$.pipe(
    startWith(COUNTRY_CODE_DEFAULT),
    tag("countryCode$"),
    shareLatest()
  )

  const phone$ = combineLatest({
    code: countryCode$,
    number: phoneInput$,
  }).pipe(
    map(({ code, number }) => `+${code} ${number}`),
    tag("phone$"),
    shareLatest()
  )

  const phoneValidation$ = phone$.pipe(
    map((phone) =>
      validatePhone(phone, {
        country: "",
        strictDetection,
        validateMobilePrefix,
      })
    ),
    tag("phoneValidation$"),
    share()
  )

  const e164$ = phoneValidation$.pipe(
    map(({ phoneNumber }) => phoneNumber || ""),
    startWith(""),
    tag("e164$"),
    shareLatest()
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

  const [onSubmit, submit$] = cb$(tag("submit$"))

  const result$ = submit$.pipe(
    withLatestFrom(e164$),
    tag("submit$ w/ e164$"),
    switchMap(([_, e164]) => submitPhone$({ e164 })),
    tag("result$"),
    share()
  )

  const track = submit$.pipe(
    withLatestFrom(countryCode$),
    mergeMap(([_, countryCode]) =>
      track$({
        name: EventName.SubmitPhoneNumber,
        properties: {
          countryCode,
        },
      })
    ),
    tag("track"),
    share()
  )

  const error$ = result$.pipe(filterResultErr(), tag("error$"), share())

  const verification$ = result$.pipe(
    filterResultOk(),
    tag("verification$"),
    share()
  )
  const verificationStatus$ = verification$.pipe(
    map((v) => v.status),
    tag("verificationStatus$")
  )
  // ! TODO: handle Twilio pending/cancelled states
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
    map((props) =>
      h(View, { ...props, onSubmit, onChangePhoneInput, onChangeCountryCode })
    ),
    tag("react")
  )

  const notice = noticeFromError$(error$)

  const value = {
    e164$,
    verificationStatus$,
  }

  return {
    react,
    notice,
    value,
    track,
  }
}
