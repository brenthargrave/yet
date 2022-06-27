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
} from "rxjs"
import { isNotNullish, isNullish } from "rxjs-etc"
import { match } from "ts-pattern"
import { checkToken$, loggedOut, token$, VerificationStatus } from "~/graph"
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
