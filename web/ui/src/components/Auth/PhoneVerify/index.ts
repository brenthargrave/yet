import { h, ReactSource } from "@cycle/react"
import { not } from "ramda"
import {
  combineLatest,
  map,
  Observable,
  switchMap,
  withLatestFrom,
  merge,
  startWith,
  shareReplay,
  tap,
  share,
  filter,
  NEVER,
} from "rxjs"
import { match } from "ts-pattern"

import { useError } from "react-use"
import {
  verifyCode$,
  VerificationStatus,
  UserError,
  Verification,
  VerificationResult,
} from "~/graph"
import { makeTagger } from "~/log"
import { makeObservableCallback } from "~/rx"
import { View } from "./View"
import { toast } from "~/toast"
import { push, routes } from "~/router"
import { error } from "~/notice"

const tag = makeTagger("PhoneVerify")

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
  const [_code$, onChangeCodeInput] = makeObservableCallback<VerificationCode>()
  const code$ = _code$.pipe(
    tag("code$"),
    shareReplay({ refCount: true, bufferSize: 1 })
  )
  const [_submit$, onSubmit] = makeObservableCallback()
  const submit$ = _submit$.pipe(tag("submit$"), share())

  const onComplete = (code: string) => onSubmit()

  const input$ = combineLatest({ e164: e164$, code: code$ }).pipe(
    tag("input$"),
    share()
  )

  const result$ = submit$.pipe(
    withLatestFrom(input$),
    tag("withLatestFrom(input)$"),
    switchMap(([_, input]) => verifyCode$(input).pipe(tag("verifyCode$"))),
    tag("result$"),
    share()
  )

  const verification$ = result$.pipe(
    filter(
      (result): result is Verification => result.__typename === "Verification",
      tag("verification$")
    )
  )
  const userError$ = result$.pipe(
    filter((result): result is UserError => result.__typename === "UserError"),
    tag("userError$")
  )

  const isLoading$ = merge(
    submit$.pipe(map((_) => true)),
    result$.pipe(map((_) => false))
  ).pipe(
    startWith(false),
    tag("isLoading$"),
    shareReplay({ refCount: true, bufferSize: 1 })
  )

  // TODO: ¿canonical location to specify verification code length?
  const validCodeLength = 4
  const codeIsInvalid$ = code$.pipe(
    map((code) => code.length === validCodeLength),
    map(not),
    startWith(true),
    tag("codeIsInvalid$"),
    share()
  )

  const isDisabledCodeInput$ = isLoading$.pipe(tag("isDisabledCodeInput$"))

  const isDisabledSubmitButton$ = combineLatest({
    isLoading: isLoading$,
    codeIsInvalid: codeIsInvalid$,
  }).pipe(
    map(({ isLoading, codeIsInvalid }) => isLoading || codeIsInvalid),
    startWith(false),
    tag("loading$ || invalid$"),
    share()
  )

  const react = combineLatest({
    e164: e164$,
    isLoading: isLoading$,
    isDisabledCodeInput: isDisabledCodeInput$,
    isDisabledSubmitButton: isDisabledSubmitButton$,
  }).pipe(
    map((props) => {
      return h(View, {
        ...props,
        onSubmit,
        onComplete,
        onChangeCodeInput,
      })
    }),
    tag("react")
  )

  const router = verification$.pipe(
    map(({ status }) =>
      match(status)
        .with(VerificationStatus.Approved, () => push(routes.home()))
        .run()
    ),
    tag("router")
  )

  const notice = userError$.pipe(
    map(({ message }) => error({ description: message })),
    tag("notice")
  )

  return {
    react,
    router,
    notice,
  }
}
