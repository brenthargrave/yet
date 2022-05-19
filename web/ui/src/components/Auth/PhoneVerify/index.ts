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
} from "rxjs"
import { match } from "ts-pattern"
import { pairwiseStartWith } from "rxjs-etc/dist/esm/operators"

import {
  verifyCode$,
  VerificationStatus,
  UserError,
  Verification,
  SubmitCodeResult,
  SubmitCodePayload,
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

  const verification$ = result$.pipe(
    filter(
      (result): result is SubmitCodePayload =>
        result.__typename === "SubmitCodePayload",
      tag("verification$")
    )
  )

  // TODO: token, me
  // const token$ = verification$.pipe(
  //   mergeMap(({ token }) => isEmpty(token.value) ? of(token.value) : EMPTY })
  // )
  // if we write to a cache in graph call, there's no need to fetch the token here.
  // ! that's a bit dirty though - how would it work otherwise? cache sink
  // cache = token$.map(token => ) ?? what is the write API for a driver?
  // that's super annoying... better off getting cache.source working first
  // that I read everything out of.... or rather, a graph source // graph.me$
  // ? so, for now assume writing token somewhere lcoal / how does app change?
  // ahah, this is the problem: you haven't designed onboarding logic here yet.
  // how?
  // - routing to /onboarding - NO, no need for a URL for that, why let people
  // direct nav to something they'll be forced through anyway?
  // ? how render Onboarding()
  // could put it on a URL - but what happens when someone attempts to direct,
  // nav to it.. in other words, how to protect it?
  // (now that I think about it, there's probably no need for /in either!)
  // decision: urls are good, actually
  // ? how route away from onboarding if onboarding compelte?
  // emit me$ upstream/
  // ? WHERE to write token$, me$ to cache?

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

  return {
    react,
    router,
    notice,
  }
}
