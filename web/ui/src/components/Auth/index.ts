import { ReactSource } from "@cycle/react"
import { setUser } from "@sentry/react"
import { pluck } from "ramda"
import {
  distinctUntilChanged,
  filter,
  from,
  map,
  merge,
  Observable,
  startWith,
  switchMap,
  tap,
  withLatestFrom,
} from "rxjs"
import { isNotNullish, isNullish } from "rxjs-etc"
import { pairwiseStartWith } from "rxjs-etc/dist/esm/operators"
import { match } from "ts-pattern"
import {
  checkToken$,
  clearSession,
  loggedOut,
  token$,
  VerificationStatus,
} from "~/graph"
import { makeTagger } from "~/log"
import { isRoute, push, routes, Source as RouterSource } from "~/router"
import { shareLatest } from "~/rx"
import { PhoneSubmit } from "./PhoneSubmit"
import { PhoneVerify } from "./PhoneVerify"

enum VerificationStep {
  Submit,
  Verify,
}

interface Sources {
  react: ReactSource
  router: RouterSource
}

export const Auth = (sources: Sources, tagPrefix?: string) => {
  const tagScope = `${tagPrefix}/Auth`
  const tag = makeTagger(tagScope)

  const {
    router: { history$ },
  } = sources

  const {
    value: { e164$, verificationStatus$ },
    ...submit
  } = PhoneSubmit(
    {
      ...sources,
    },
    tagScope
  )

  const {
    value: { me$, verified$ },
    ...verify
  } = PhoneVerify(
    {
      props: { e164$ },
      ...sources,
    },
    tagScope
  )

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
      return step === VerificationStep.Submit ? submit.react : verify.react
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
    tap(() => from(clearSession())),
    tap(() => setUser(null)),
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

  const value = { me$ }
  const graph = merge(verify.graph, logout$)
  const router = merge(redirectToRoot$, redirectAfterAuth$)
  const notice = merge(...pluck("notice", [submit, verify]))
  const track = merge(...pluck("track", [submit, verify]))

  return {
    react,
    router,
    notice,
    value,
    graph,
    track,
  }
}
