import { ReactSource } from "@cycle/react"
import {
  combineLatest,
  debounceTime,
  EMPTY,
  map,
  merge,
  of,
  startWith,
  switchMap,
  Observable,
} from "rxjs"
import { delayUntil, pluck as pluck$ } from "rxjs-etc/dist/esm/operators"
import { match } from "ts-pattern"
import { filterResultErr, filterResultOk } from "ts-results/rxjs-operators"
import { Source as ActionSource } from "~/action"
import {
  getOppProfile$,
  getPayment$,
  Source as GraphSource,
  upsertPayment$,
  Money,
} from "~/graph"
import { makeTagger } from "~/log"
import { error } from "~/notice"
import { routes, Source as RouterSource } from "~/router"
import { mapTo, shareLatest } from "~/rx"
import { Amount } from "./Amount"
import { Recipient } from "./Recipient"
import { pluck } from "~/fp"

export enum Step {
  recipient = "recipient",
  amount = "amount",
}

export interface Sources {
  react: ReactSource
  router: RouterSource
  graph: GraphSource
  action: ActionSource
}

export const Create = (sources: Sources, tagPrefix?: string) => {
  const tagScope = `${tagPrefix}/Create`
  const tag = makeTagger(tagScope)

  const {
    router: { history$ },
    graph: { me$ },
    action: { action$ },
  } = sources

  const params$ = history$.pipe(
    switchMap((route) =>
      match(route)
        .with({ name: routes.newOppPayment.name }, ({ params }) => of(params))
        .otherwise(() => EMPTY)
    ),
    tag("params$")
  )

  const pid$ = params$.pipe(
    map((p) => p.pid),
    tag("pid$"),
    shareLatest()
  )

  const oid$ = params$.pipe(
    map((p) => p.oid),
    tag("oid$"),
    shareLatest()
  )

  const existing$ = pid$.pipe(
    switchMap((id) => getPayment$({ id }, false)),
    tag("existing$"),
    shareLatest()
  )
  const recordPayee = existing$.pipe(
    map((e) => e?.payee),
    tag("existingPayee$"),
    shareLatest()
  )
  const recordAmount = existing$.pipe(
    map((e) => e?.amount),
    tag("recordAmount"),
    shareLatest()
  )

  const oppProfileResult$ = oid$.pipe(
    switchMap((oid) => getOppProfile$({ id: oid })),
    tag("oppProfileResult$"),
    shareLatest()
  )

  const userError$ = oppProfileResult$.pipe(
    filterResultErr(),
    tag("userError$")
  )

  const errorNotice$ = userError$.pipe(
    map((userError) => error({ description: userError.message })),
    tag("errorNotice$")
  )

  const oppProfile$ = oppProfileResult$.pipe(
    filterResultOk(),
    tag("oppProfile$"),
    shareLatest()
  )

  const opp$ = oppProfile$.pipe(pluck$("opp"), tag("opp$"), shareLatest())

  // Step: recipient
  const recipient = Recipient({ ...sources, props: { opp$ } }, tagScope)
  const { recipient$: selectedPayee } = recipient.value

  const payee = merge(recordPayee, selectedPayee).pipe(
    tag("payee"),
    shareLatest()
  )

  // Step: amount
  const defaultAmount: Observable<Money> = combineLatest({
    opp: opp$,
    recordAmount,
  }).pipe(
    map(({ opp, recordAmount }) => recordAmount || opp.fee),
    tag("defaultAmount"),
    shareLatest()
  )
  const amount = Amount(
    { ...sources, props: { opp$, payee, defaultAmount } },
    tagScope
  )
  const amountPayee = amount.value.payee.pipe(
    startWith(null),
    tag("amountPayee"),
    shareLatest()
  )
  const { onChangeAmount$ } = amount.value
  const editedAmount = merge(onChangeAmount$, defaultAmount).pipe(
    tag("editedAmount"),
    shareLatest()
  )

  const edit = merge(selectedPayee, onChangeAmount$).pipe(tag("edit"))
  const payload = combineLatest({
    id: pid$,
    opp: opp$,
    payee: amountPayee,
    amount: editedAmount,
  }).pipe(
    map(({ id, opp, payee, amount: { currency, amount } }) => ({
      id,
      oppId: opp.id,
      payeeId: payee?.id,
      amount: {
        currency,
        amount,
      },
    })),
    tag("payload")
  )
  const upsert = payload.pipe(
    delayUntil(edit),
    debounceTime(200),
    switchMap((input) => upsertPayment$(input)),
    tag("upsert")
  )

  const isSyncing = merge(
    edit.pipe(mapTo(true)),
    upsert.pipe(mapTo(false))
  ).pipe(startWith(false), tag("isSyncing"), shareLatest())

  const step$ = combineLatest({ isSyncing, payee: amountPayee }).pipe(
    map(({ payee }) => (payee ? Step.amount : Step.recipient)),
    tag("step$"),
    shareLatest()
  )

  const react = step$.pipe(
    switchMap((step) =>
      match(step)
        .with(Step.recipient, () => recipient.react)
        .with(Step.amount, () => amount.react)
        .exhaustive()
    )
  )

  // const action = merge(...pluck("action", [edit, show]))
  const notice = merge(errorNotice$)
  const router = merge(...pluck("router", [amount]))

  return {
    react,
    // action,
    notice,
    router,
  }
}
