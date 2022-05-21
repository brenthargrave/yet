import { h, ReactSource } from "@cycle/react"
import {
  BehaviorSubject,
  switchMap,
  merge,
  Observable,
  map,
  startWith,
  shareReplay,
  of,
  EMPTY,
  mergeMap,
  tap,
} from "rxjs"
import { match } from "ts-pattern"
import { loggedOut, VerificationStatus } from "~/graph"

import { makeTagger } from "~/log"
import { push, routes, Source as RouterSource } from "~/router"
import { PhoneSubmit } from "./PhoneSubmit"
import { PhoneVerify } from "./PhoneVerify"

const tag = makeTagger("Auth")

enum VerificationStep {
  Submit,
  Verify,
}

interface Sources {
  react: ReactSource
  router: RouterSource
}

export const Auth = (sources: Sources) => {
  const {
    react: submitView$,
    notice: submitNotice$,
    value: { e164$, verificationStatus$ },
  } = PhoneSubmit({
    ...sources,
  })

  const {
    react: verifyView$,
    router: verifyRouter$,
    notice: verifyNotice$,
    graph: verifyGraph$,
    value,
  } = PhoneVerify({
    props: { e164$ },
    ...sources,
  })

  const step$: Observable<VerificationStep> = verificationStatus$.pipe(
    map((status) =>
      match(status)
        .with(VerificationStatus.Pending, () => VerificationStep.Verify)
        .run()
    ),
    startWith(VerificationStep.Submit),
    tag("step$"),
    shareReplay()
  )

  const react = step$.pipe(
    switchMap((step) => {
      return step === VerificationStep.Submit ? submitView$ : verifyView$
    }),
    tag("react")
  )

  const logout$ = sources.router.history$.pipe(
    mergeMap((route) => (route.name === "out" ? of(loggedOut()) : EMPTY)),
    tag("logout$")
  )
  const redirectRoot$ = logout$.pipe(
    map((_) => push(routes.root())),
    tag("redirectToRoot$")
  )

  const router = merge(verifyRouter$, redirectRoot$)
  const notice = merge(verifyNotice$, submitNotice$)
  const graph = merge(verifyGraph$, logout$)

  return {
    react,
    router,
    notice,
    value,
    graph,
  }
}
