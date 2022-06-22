import { ReactSource } from "@cycle/react"
import {
  switchMap,
  merge,
  Observable,
  map,
  startWith,
  shareReplay,
  filter,
  distinctUntilChanged,
} from "rxjs"
import { isNotNullish } from "rxjs-etc"
import { match } from "ts-pattern"
import { token$, loggedOut, VerificationStatus } from "~/graph"

import { makeTagger } from "~/log"
import { isRoute, push, routes, Source as RouterSource } from "~/router"
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

  const tokenInvalidated$ = token$.pipe(
    filter(isNotNullish),
    distinctUntilChanged(),
    // TODO: nil token object === invalidated
    // switchMap(token => checkToken$(token)),
    tag("checkToken$")
  )
  const logout$ = sources.router.history$.pipe(
    filter((route) => isRoute(routes.out(), route)),
    map((_) => loggedOut()),
    tag("logout$")
  )
  const redirectToRoot$ = logout$.pipe(
    map((_) => push(routes.root())),
    tag("redirectToRoot$")
  )

  const graph = merge(verifyGraph$, logout$)
  const router = merge(verifyRouter$, redirectToRoot$)
  const notice = merge(verifyNotice$, submitNotice$)

  return {
    react,
    router,
    notice,
    value,
    graph,
  }
}
