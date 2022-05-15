import { h, ReactSource } from "@cycle/react"
import { BehaviorSubject, combineLatest, map, switchMap } from "rxjs"

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

  // TODO: ¿maintain subs to all step views concurrently?
  // const react = combineLatest({
  //   step: step$$,
  //   submit: submitView$,
  //   verify: verifyView$,
  // }).pipe(
  //   map(({ step, submit, verify }) =>
  //     step === VerificationStep.Submit ? submit : verify
  //   )
  // )
  const react = step$$.pipe(
    switchMap((step) => {
      return step === VerificationStep.Submit ? submitView$ : verifyView$
    })
  )
  return {
    react,
  }
}
