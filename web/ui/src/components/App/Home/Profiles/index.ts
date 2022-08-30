import { h, ReactSource } from "@cycle/react"
import {
  combineLatest,
  distinctUntilChanged,
  EMPTY,
  filter,
  map,
  Observable,
  share,
  startWith,
  switchMap,
} from "rxjs"
import { isNotNullish } from "rxjs-etc"
import { match } from "ts-pattern"
import { filterResultOk } from "ts-results/rxjs-operators"
import { Source as ActionSource } from "~/action"
import { getProfile$, Profile, Source as GraphSource } from "~/graph"
import { makeTagger } from "~/log"
import { routes, Source as RouterSource } from "~/router"
import { shareLatest, cb$ } from "~/rx"
import { Show } from "./Show"

export enum State {
  show = "show",
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
  } = sources
  const me$ = _me$.pipe(filter(isNotNullish), tag("me$"))

  const state$ = history$.pipe(
    map((route) =>
      match(route)
        .with({ name: routes.me.name }, () => State.show)
        .otherwise(() => State.pending)
    ),
    distinctUntilChanged(),
    tag("THIS state$"),
    shareLatest()
  )

  const show = Show(sources, tagScope)

  const react = state$.pipe(
    switchMap((state) =>
      match(state)
        .with(State.show, () => show.react)
        .with(State.pending, () => EMPTY)
        // .with(State.edit)
        .exhaustive()
    ),
    tag("THIS react")
  )

  return {
    react,
    // router,
  }
}
