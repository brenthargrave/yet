import { h, ReactSource } from "@cycle/react"
import {
  BehaviorSubject,
  catchError,
  combineLatest,
  filter,
  map,
  merge,
  Observable,
  share,
  startWith,
  switchMap,
  tap,
  withLatestFrom,
} from "rxjs"
import { pairwiseStartWith, pluck } from "rxjs-etc/dist/esm/operators"
import { match } from "ts-pattern"
import { not } from "~/fp"
import {
  Customer,
  loggedIn,
  SubmitCodePayload,
  SubmitCodeResult,
  UserError,
  Verification,
  VerificationStatus,
  verifyCode$,
} from "~/graph"
import { makeTagger } from "~/log"
import { error } from "~/notice"
import { push, routes } from "~/router"
import { callback$, makeObservableCallback, shareLatest } from "~/rx"
import { View } from "./View"

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
  const code$ = code$$.asObservable().pipe(tag("code$"), shareLatest())
  const onChangeCodeInput = (code: string) => code$$.next(code)

  const codeLatestPair$ = code$.pipe(
    pairwiseStartWith(""),
    tag("codeLatestPair$"),
    shareLatest()
  )

  const { $: submit$, cb: onSubmit } = callback$(tag("submit$"))

  const { $: complete, cb: onComplete } = makeObservableCallback<string>()
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
    catchError((error, _caught$) => {
      code$$.next("")
      throw error
    }),
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
    tag("me$")
  )
  const token$ = me$.pipe(pluck("token"), tag("token$"))

  const userError$ = result$.pipe(
    filter((result): result is UserError => result.__typename === "UserError"),
    tap((_) => code$$.next("")), // reset code on error | TODO: how fix focus?
    tag("userError$")
  )

  const isLoading$ = merge(
    submit$.pipe(map((_) => true)),
    result$.pipe(map((_) => false))
  ).pipe(startWith(false), tag("isLoading$"), shareLatest())

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

  const graph = token$.pipe(map((token) => loggedIn(token)))

  return {
    react,
    router,
    notice,
    value,
    graph,
  }
}
