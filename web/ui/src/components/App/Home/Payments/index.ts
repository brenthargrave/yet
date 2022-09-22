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
import { Create } from "./Create"

export enum State {
  create = "create",
}
// show = "show",
// edit = "edit",
// pending = "pending",

export interface Sources {
  react: ReactSource
  router: RouterSource
  graph: GraphSource
  action: ActionSource
}

export const Payments = (sources: Sources, tagPrefix?: string) => {
  const tagScope = `${tagPrefix}/Payments`
  const tag = makeTagger(tagScope)

  const {
    router: { history$ },
    graph: { me$ },
    action: { action$ },
  } = sources

  const state$ = of(State.create)
  // const state$ = history$.pipe(
  //   map((route) =>
  //     match(route)
  //       .with({ name: routes.me.name }, () => State.show)
  //       .otherwise(() => State.pending)
  //   ),
  //   mergeWith(localState$),
  //   distinctUntilChanged(),
  //   tag("state$"),
  //   shareLatest()
  // )

  const create = Create(sources, tagScope)

  const react = state$.pipe(
    switchMap((state) =>
      match(state)
        //       .with(State.pending, () => EMPTY)
        .with(State.create, () => create.react)
        .exhaustive()
    ),
    tag("react")
  )

  // const action = merge(...pluck("action", [edit, show]))
  const notice = merge(...pluck("notice", [create]))
  const router = merge(...pluck("router", [create]))

  return {
    react,
    // action,
    notice,
    router,
  }
}
