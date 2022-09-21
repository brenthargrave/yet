import { ReactSource } from "@cycle/react"
import { pluck } from "ramda"
import {
  distinctUntilChanged,
  EMPTY,
  map,
  merge,
  mergeWith,
  of,
  share,
  switchMap,
} from "rxjs"
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
    graph: { me$ },
    action: { action$ },
  } = sources

  const localState$ = action$.pipe(
    switchMap((action) =>
      match(action)
        .with({ type: Actions.showProfile }, () => of(State.show))
        .with({ type: Actions.editProfile }, () => of(State.edit))
        .otherwise(() => EMPTY)
    ),
    tag("localState$"),
    share()
  )

  const state$ = history$.pipe(
    map((route) =>
      match(route)
        .with({ name: routes.me.name }, () => State.show)
        .otherwise(() => State.pending)
    ),
    mergeWith(localState$),
    distinctUntilChanged(),
    tag("state$"),
    shareLatest()
  )

  const show = Show(sources, tagScope)
  const edit = Edit(sources, tagScope)

  const react = state$.pipe(
    switchMap((state) =>
      match(state)
        .with(State.show, () => show.react)
        .with(State.edit, () => edit.react)
        .with(State.pending, () => EMPTY)
        .exhaustive()
    ),
    tag("react")
  )

  const action = merge(...pluck("action", [edit, show]))
  const notice = merge(...pluck("notice", [edit]))
  const router = merge(...pluck("router", [show]))

  return {
    react,
    action,
    notice,
    router,
  }
}
