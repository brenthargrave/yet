import { ReactSource } from "@cycle/react"
import {
  distinctUntilChanged,
  filter,
  map,
  merge,
  Observable,
  shareReplay,
  startWith,
  switchMap,
  withLatestFrom,
} from "rxjs"
import { isNotNullish, isNullish } from "rxjs-etc"
import { pairwiseStartWith } from "rxjs-etc/dist/esm/operators"
import { match } from "ts-pattern"
import { checkToken$, loggedOut, token$, VerificationStatus } from "~/graph"
import { makeTagger } from "~/log"
import { isRoute, push, routes, Source as RouterSource } from "~/router"
import { shareLatest } from "~/rx"
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
    router: { history$ },
  } = sources

  const {
    react: submitView$,
    notice: submitNotice$,
    value: { e164$, verificationStatus$ },
  } = PhoneSubmit({
    ...sources,
  })

  const {
    react: verifyView$,
    notice: verifyNotice$,
    graph: verifyGraph$,
    value: { me$, verified$ },
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
    shareLatest()
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
    tag("tokenInvalidated$ > distinctUntilChanged"),
    switchMap((_) => checkToken$()),
    filter((token) => isNullish(token?.value)),
    tag("tokenInvalidated$")
  )
  const logoutRequested$ = sources.router.history$.pipe(
    filter((route) => isRoute(routes.out(), route)),
    tag("logoutRequested$")
  )
  const logout$ = merge(tokenInvalidated$, logoutRequested$).pipe(
    map((_) => loggedOut()),
    tag("logout$")
  )
  const redirectToRoot$ = logout$.pipe(
    map((_) => push(routes.root())),
    tag("redirectToRootRoute$")
  )

  const priorAndCurrentRoute$ = history$.pipe(
    pairwiseStartWith(routes.root()),
    tag("priorAndCurrentRoute$")
  )

  const redirectAfterAuth$ = verified$.pipe(
    filter((isVerified) => isVerified),
    withLatestFrom(priorAndCurrentRoute$),
    map(([_, [priorRoute, currentRoute]]) => push(priorRoute ?? routes.root())),
    tag("redirectToPriorOrRootRoute$")
  )

  const graph = merge(verifyGraph$, logout$)
  const router = merge(redirectToRoot$, redirectAfterAuth$)
  const notice = merge(verifyNotice$, submitNotice$)
  const value = { me$ }

  return {
    react,
    router,
    notice,
    value,
    graph,
  }
}
