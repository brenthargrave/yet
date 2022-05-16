import { h, ReactSource } from "@cycle/react"
import { BehaviorSubject, switchMap } from "rxjs"

import { tag } from "~/log"
import { Source as RouterSource } from "~/router"
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

export const Auth = (sources: Sources) => {
  const step$$ = new BehaviorSubject<VerificationStep>(VerificationStep.Submit)
  const onVerificationPending = () => step$$.next(VerificationStep.Verify)

  const {
    react: submitView$,
    value: { e164$ },
  } = PhoneSubmit({
    props: {
      onVerificationPending,
    },
    ...sources,
  })

  const { react: verifyView$ } = PhoneVerify({
    props: { e164$ },
    ...sources,
  })

  const react = step$$.pipe(
    tag("step$$"),
    switchMap((step) => {
      return step === VerificationStep.Submit ? submitView$ : verifyView$
    }),
    tag("Auth.react$")
  )
  return {
    react,
  }
}
