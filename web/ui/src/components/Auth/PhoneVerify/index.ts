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
  filterType,
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
import { routes } from "~/router"

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
    tap((result) => {
      match(result)
        .with({ __typename: "Verification" }, (result) => {
          console.debug(result)
          match(result.status)
            .with(VerificationStatus.Pending, () => {
              // TODO: this shouldn't be POSSIBLE, redesign the flow
            })
            .with(VerificationStatus.Approved, () => {
              routes.home().push()
            })
            .with(VerificationStatus.Canceled, () => {
              // TODO: make this impossible!
              toast({
                title: "Oops!",
                description: "Phone verification cancelled",
                status: "error",
              })
            })
            .exhaustive()
        })
        .with({ __typename: "UserError" }, ({ message }) => {
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

  // const userError$ = result$.pipe(
  //   filter((result) => result.__typename === "UserError")
  // )

  const verification$ = result$.pipe(
    filter(
      (result): result is Verification => result.__typename === "Verification"
    )
  )

  // TODO: handle response!
  // const verification$: Observable<V
  // const userError$
  // const error$
  // const toast$ = merge(userError, error) => ? would need to import h(Toast)!
  /// ...and then what: { value: { toast }}
  // ! on 2nd thought: an notifications$ sink might be better
  // no need to refactor later, only *present* them differently from App
  // ?why not already? too many imperative outcomes: callbacks,routing
  // ?would require creating a "fake" sink and binidng it to react sink

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

  const router = NEVER
  // const router = verification$.pipe(
  //   map(({ status }) =>
  //     match(status)
  //       .with(VerificationStatus.Approved, () => routes.home())
  //       .run()
  //   )
  // )

  return {
    react,
    router,
  }
}
