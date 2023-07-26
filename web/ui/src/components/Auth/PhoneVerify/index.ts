import { h, ReactSource } from "@cycle/react"
import { createRef } from "react"
import {
  BehaviorSubject,
  combineLatest,
  delay,
  filter,
  map,
  merge,
  mergeMap,
  Observable,
  share,
  startWith,
  switchMap,
  tap,
  withLatestFrom,
} from "rxjs"
import { pairwiseStartWith, pluck } from "rxjs-etc/dist/esm/operators"
import { match } from "ts-pattern"
import { filterResultErr, filterResultOk } from "ts-results/rxjs-operators"
import { not } from "~/fp"
import {
  EventName,
  loggedIn,
  track$,
  VerificationStatus,
  verifyCode$,
} from "~/graph"
import { makeTagger } from "~/log"
import { cb$, noticeFromError$, shareLatest } from "~/rx"
import { View } from "./View"

interface Props {
  e164$: Observable<string>
}

interface Sources {
  react: ReactSource
  props: Props
}

export const PhoneVerify = (sources: Sources, tagPrefix?: string) => {
  const tag = makeTagger(`${tagPrefix}/PhoneVerify`)

  const firstInputRef = createRef<HTMLInputElement>()

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

  const [onSubmit, submit$] = cb$(tag("submit$"))
  const [onComplete, complete] = cb$(tag("complete"))

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

  const request$ = merge(submit$, complete$)
  const result$ = request$.pipe(
    withLatestFrom(input$),
    tag("withLatestFrom(input)$"),
    switchMap(([_, input]) => verifyCode$(input).pipe(tag("verifyCode$"))),
    tap((result) => {
      if (result.err) {
        code$$.next("")
      }
    }),
    tag("result$"),
    share()
  )
  // NOTE: must delay else focus is wiped out by input clearing/reset
  // Also, note that it needs a persistent subscription, so can't be part of
  // transient result$ subsciption (closes once complete)
  const refocusInput$ = result$.pipe(
    delay(20),
    tap((_) => firstInputRef.current?.focus()),
    share()
  )

  const submitCodePayload$ = result$.pipe(
    filterResultOk(),
    tag("submitCodePayload$"),
    share()
  )
  const verification$ = submitCodePayload$.pipe(
    pluck("verification"),
    tag("verification$"),
    share()
  )
  const me$ = submitCodePayload$.pipe(pluck("me"), tag("me$"), share())

  const token$ = me$.pipe(pluck("token"), tag("token$"), share())

  const error$ = result$.pipe(filterResultErr(), tag("error$"), share())

  const isLoading$ = merge(
    request$.pipe(map((_) => true)),
    result$.pipe(map((_) => false))
  ).pipe(startWith(false), tag("isLoading$"), shareLatest())

  const validCodeLength = 4
  const codeIsInvalid$ = code$.pipe(
    map((code) => code.length === validCodeLength),
    map(not),
    startWith(true),
    tag("codeIsInvalid$"),
    shareLatest()
  )

  const isDisabledCodeInput$ = isLoading$.pipe(
    withLatestFrom(refocusInput$),
    map(([v, _]) => v),
    tag("isDisabledCodeInput$"),
    startWith(false),
    shareLatest()
  )

  const isDisabledSubmitButton$ = combineLatest({
    isLoading: isLoading$,
    codeIsInvalid: codeIsInvalid$,
  }).pipe(
    map(({ isLoading, codeIsInvalid }) => isLoading || codeIsInvalid),
    startWith(false),
    tag("loading$ || invalid$"),
    shareLatest()
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
        firstInputRef,
      })
    }),
    tag("react")
  )

  const verified$ = verification$.pipe(
    map(({ status }) =>
      match(status)
        .with(VerificationStatus.Approved, () => true)
        .otherwise(() => false)
    ),
    startWith(false),
    tag("verified$"),
    shareLatest()
  )

  const notice = noticeFromError$(error$)
  const value = { me$, verified$ }
  const graph = token$.pipe(map((token) => loggedIn(token)))
  const track = complete$.pipe(
    mergeMap((_) =>
      track$({
        name: EventName.VerifyPhoneNumber,
        properties: {},
      })
    ),
    tag("track"),
    share()
  )

  return {
    react,
    notice,
    value,
    graph,
    track,
  }
}
