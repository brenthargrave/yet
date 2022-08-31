import { ReactSource } from "@cycle/react"
import { pluck } from "ramda"
import {
  distinctUntilChanged,
  EMPTY,
  filter,
  map,
  merge,
  mergeWith,
  of,
  share,
  switchMap,
} from "rxjs"
import { isNotNullish } from "rxjs-etc"
import { match } from "ts-pattern"
import { Actions, Source as ActionSource } from "~/action"
import { Source as GraphSource } from "~/graph"
import { makeTagger } from "~/log"
import { routes, Source as RouterSource } from "~/router"
import { shareLatest } from "~/rx"
import { Edit } from "./Edit"
import { Show } from "./Show"

export enum State {
  show = "show",
  edit = "edit",
  pending = "pending",
}

export interface Sources {
  react: ReactSource
  router: RouterSource
  graph: GraphSource
  action: ActionSource
}

export const Profiles = (sources: Sources, tagPrefix?: string) => {
  const tagScope = `${tagPrefix}/Profiles`
  const tag = makeTagger(tagScope)

  const {
    router: { history$ },
    graph: { me$: _me$ },
    action: { action$ },
  } = sources
  const me$ = _me$.pipe(filter(isNotNullish), tag("me$"))

  const edit$ = action$.pipe(
    tag("action"),
    switchMap((action) =>
      match(action)
        .with({ type: Actions.editOpp }, () => of(State.edit))
        .otherwise(() => EMPTY)
    ),
    tag("edit"),
    share()
  )

  const state$ = history$.pipe(
    map((route) =>
      match(route)
        // .with({ name: routes.me.name }, () => State.show)
        .with({ name: routes.me.name }, () => State.edit)
        .otherwise(() => State.pending)
    ),
    mergeWith(edit$),
    distinctUntilChanged(),
    tag("THIS state$"),
    shareLatest()
  )

  const show = Show(sources, tagScope)
  const edit = Edit(sources, tagScope)

  const react = state$.pipe(
    switchMap((state) =>
      match(state)
        .with(State.show, () => show.react)
        .with(State.pending, () => EMPTY)
        .with(State.edit, () => edit.react)
        .with(State.edit, () => EMPTY)
        .exhaustive()
    ),
    tag("THIS react")
  )

  const action = merge(...pluck("action", [show]))

  return {
    react,
    action,
  }
}
