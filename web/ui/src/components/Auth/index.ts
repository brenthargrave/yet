import { h, ReactSource } from "@cycle/react"
import {
  BehaviorSubject,
  switchMap,
  merge,
  Observable,
  map,
  startWith,
  shareReplay,
} from "rxjs"
import { match } from "ts-pattern"
import { VerificationStatus } from "~/graph"

import { makeTagger } from "~/log"
import { Source as RouterSource } from "~/router"
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
    props: {},
    ...sources,
  })

  const {
    react: verifyView$,
    router: verifyRouter$,
    notice: verifyNotice$,
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

  const router = merge(verifyRouter$)
  const notice = merge(verifyNotice$, submitNotice$)

  return {
    react,
    router,
    notice,
  }
}
