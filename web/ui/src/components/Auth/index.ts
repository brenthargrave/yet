import { h, ReactSource } from "@cycle/react"
import { BehaviorSubject, combineLatest, map, catchError } from "rxjs"

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

  const react = combineLatest({
    step: step$$,
    submit: submitView$,
    verify: verifyView$,
  }).pipe(
    map(({ step, submit, verify }) =>
      step === VerificationStep.Submit ? submit : verify
    ),
    catchError((error, caught$) => {
      console.error(error)
      // captureException(error)
      return caught$
    })
  )
  return {
    react,
  }
}
