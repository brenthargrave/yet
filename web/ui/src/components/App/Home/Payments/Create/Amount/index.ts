import { h, ReactSource } from "@cycle/react"
import { combineLatest, filter, map, merge, Observable } from "rxjs"
import { isNotNullish } from "rxjs-etc"
import { Source as ActionSource } from "~/action"
import { Profile, Money, Opp, Source as GraphSource, Maybe } from "~/graph"
import { makeTagger } from "~/log"
import { Source as RouterSource, back } from "~/router"
import { cb$, shareLatest } from "~/rx"
import { View, AMOUNT_MIN } from "./View"

export interface Sources {
  react: ReactSource
  router: RouterSource
  graph: GraphSource
  action: ActionSource
  props: {
    opp$: Observable<Opp>
    payee: Observable<Profile | undefined | null>
    defaultAmount: Observable<Money>
  }
}

export const Amount = (sources: Sources, tagPrefix?: string) => {
  const tagScope = `${tagPrefix}/Amount`
  const tag = makeTagger(tagScope)

  const {
    graph: { me$ },
    props: { opp$: opp, payee: _payee, defaultAmount },
  } = sources

  const payee = _payee.pipe(filter(isNotNullish), tag("payee"), shareLatest())

  const [onChangeAmount, onChangeAmount$] = cb$<Money>(tag("onChangeAmount$"))
  const [onChangePayee, changePayee$] = cb$<Money>(tag("onChangePayee$"))

  const [onClickBack, onClickBack$] = cb$(tag("onClickBack$"))
  const back$ = onClickBack$.pipe(
    map((_) => back()),
    tag("back$")
  )

  const [onClickPay, onClickPay$] = cb$(tag("onClickPay$"))
  // TODO: next?

  const editedPayee = merge(
    //
    payee,
    changePayee$.pipe(map((_) => null))
  ).pipe(shareLatest(), tag("editedPayeee"))

  const amount$ = merge(defaultAmount, onChangeAmount$).pipe(tag("amount$"))

  const isAmountInvalid = amount$.pipe(
    map(({ amount, currency }) => amount < AMOUNT_MIN),
    tag("isDisabledSubmit"),
    shareLatest()
  )
  const isDisabledSubmit = isAmountInvalid

  const props$ = combineLatest({
    defaultAmount: amount$,
    payee,
    opp,
    isAmountInvalid,
    isDisabledSubmit,
  }).pipe(tag("props$"))

  const react = props$.pipe(
    map((props) =>
      h(View, {
        ...props,
        onChangePayee,
        onChangeAmount,
        onClickBack,
        onSubmit: onClickPay,
      })
    )
  )

  const router = merge(back$)

  const value = {
    payee: editedPayee,
    onChangeAmount$,
  }

  return {
    react,
    router,
    value,
  }
}
