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
  const step$$ = new BehaviorSubject<VerificationStep>(VerificationStep.Submit)
  const onVerificationPending = () => step$$.next(VerificationStep.Verify)

  const {
    react: submitView$,
    value: { e164$, verificationStatus$ },
  } = PhoneSubmit({
    props: {
      onVerificationPending,
    },
    ...sources,
  })

  const {
    react: verifyView$,
    router: verifyRouter,
    notice: verifyNotice,
  } = PhoneVerify({
    props: { e164$ },
    ...sources,
  })

  // const step$: Observable<VerificationStep> = verificationStatus$.pipe(
  //   map((status) =>
  //     status === VerificationStatus.Pending
  //       ? VerificationStep.Verify
  //       : VerificationStep.Submit
  //   ),
  //   startWith(VerificationStep.Submit),
  //   tag("step$"),
  //   shareReplay({ bufferSize: 1, refCount: true })
  // )

  const react = step$$.pipe(
    switchMap((step) => {
      return step === VerificationStep.Submit ? submitView$ : verifyView$
    }),
    tag("react")
  )

  const router = merge(verifyRouter)
  const notice = merge(verifyNotice)

  return {
    react,
    router,
    notice,
  }
}
