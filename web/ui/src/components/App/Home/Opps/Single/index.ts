import { ReactSource } from "@cycle/react"
import {
  distinctUntilChanged,
  map,
  merge,
  Observable,
  share,
  switchMap,
  withLatestFrom,
} from "rxjs"
import { delayUntil, equals } from "rxjs-etc/dist/esm/operators"
import { match } from "ts-pattern"
import { filterResultErr, filterResultOk } from "ts-results/rxjs-operators"
import { getOpp$, ID, isOwnedBy, me$, Source as GraphSource } from "~/graph"
import { makeTagger } from "~/log"
import { error } from "~/notice"
import { shareLatest } from "~/rx"
import { State as OppsState } from ".."
import { Edit } from "./Edit"

export enum State {
  edit = "edit",
  // show = "show",
}

interface Props {
  state$: Observable<OppsState>
  id$: Observable<ID>
}

interface Sources {
  react: ReactSource
  graph: GraphSource
  props: Props
}

export const Single = (sources: Sources, tagPrefix?: string) => {
  const tagScope = `${tagPrefix}/Edit`
  const tag = makeTagger(tagScope)

  const {
    props: { state$: oppsState$, id$ },
  } = sources

  const result$ = id$.pipe(
    switchMap((id) => getOpp$(id)),
    tag("result$"),
    shareLatest()
  )

  const record$ = result$.pipe(filterResultOk(), tag("record$"), shareLatest())

  const userError$ = result$.pipe(filterResultErr(), tag("userError$"), share())

  const userErrorNotice$ = userError$.pipe(
    map(({ message }) => error({ description: message })),
    tag("userErrorNotice$"),
    share()
  )

  const edit = Edit({ ...sources, props: { record$ } }, tagScope)

  const state$ = oppsState$.pipe(
    equals(OppsState.single),
    delayUntil(record$),
    withLatestFrom(me$, record$),
    // TODO: vary state by Opp status (locked / cosigned?)
    map(([_, me, opp]) => (isOwnedBy(opp, me) ? State.edit : State.edit)),
    distinctUntilChanged(),
    tag("state$"),
    shareLatest()
  )

  const react = state$.pipe(
    switchMap((state) =>
      match(state)
        .with(State.edit, () => edit.react)
        .exhaustive()
    ),
    tag("react"),
    share()
  )

  const action = merge(edit.action)
  const notice = merge(userErrorNotice$, edit.notice)

  return {
    react,
    notice,
    action,
  }
}