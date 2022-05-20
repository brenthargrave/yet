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
  share,
  filter,
  BehaviorSubject,
  mergeMap,
  EMPTY,
  of,
  tap,
} from "rxjs"
import { match } from "ts-pattern"
import { pairwiseStartWith, pluck } from "rxjs-etc/dist/esm/operators"

import {
  verifyCode$,
  VerificationStatus,
  UserError,
  Verification,
  Customer,
  SubmitCodeResult,
  SubmitCodePayload,
  setToken,
} from "~/graph"
import { makeTagger } from "~/log"
import { makeObservableCallback } from "~/rx"
import { View } from "./View"
import { push, routes } from "~/router"
import { error } from "~/notice"

const tag = makeTagger("PhoneVerify")

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
  const code$$ = new BehaviorSubject<string>("")
  const code$ = code$$.asObservable().pipe(tag("code$"), shareReplay())
  const onChangeCodeInput = (code: string) => code$$.next(code)

  const codeLatestPair$ = code$.pipe(
    pairwiseStartWith(""),
    tag("codeLatestPair$"),
    shareReplay()
  )

  const [_submit$, onSubmit] = makeObservableCallback()
  const submit$ = _submit$.pipe(tag("submit$"), share())

  const [complete, onComplete] = makeObservableCallback<string>()
  const complete$ = complete.pipe(
    withLatestFrom(codeLatestPair$),
    tag("withLatestFrom(codeLatestPairs$)"),
    // NOTE: only fire when last digit in PIN is changed, not the prior values
    filter(([_, [prev, curr]]) => {
      const sameLengths = prev.length === curr.length
      const sameLastDigit = curr.slice(-1) === prev.slice(-1)
      return !(sameLengths && sameLastDigit)
    }),
    tag("complete$"),
    share()
  )

  const input$ = combineLatest({ e164: e164$, code: code$ }).pipe(
    tag("input$"),
    share()
  )

  const result$: Observable<SubmitCodeResult> = merge(submit$, complete$).pipe(
    withLatestFrom(input$),
    tag("withLatestFrom(input)$"),
    switchMap(([_, input]) => verifyCode$(input).pipe(tag("verifyCode$"))),
    tag("result$"),
    share()
  )

  // TODO: payload$ = result$.pipe(filter(result => result.success))
  const submitCodePayload$: Observable<SubmitCodePayload> = result$.pipe(
    filter(
      (result): result is SubmitCodePayload =>
        result.__typename === "SubmitCodePayload",
      tag("submitCodePayload$")
    )
  )
  const verification$: Observable<Verification> = submitCodePayload$.pipe(
    pluck("verification"),
    tag("verification$")
  )
  const me$: Observable<Customer> = submitCodePayload$.pipe(
    pluck("me"),
    // TODO: move token mgmt inside graph.submitCode$
    tap((customer) => setToken(customer.token)),
    tag("me$")
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
    code: code$,
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
        .with(VerificationStatus.Approved, () => push(routes.root()))
        .run()
    ),
    tag("router")
  )

  const notice = userError$.pipe(
    map(({ message }) => error({ description: message })),
    tag("notice")
  )

  const value = { me$ }

  return {
    react,
    router,
    notice,
    value,
  }
}
