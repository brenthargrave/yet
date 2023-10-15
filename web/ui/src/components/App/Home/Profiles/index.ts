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
  withLatestFrom,
} from "rxjs"
import { match } from "ts-pattern"
import { Actions, Source as ActionSource } from "~/action"
import { isLurking, Source as GraphSource } from "~/graph"
import { makeTagger } from "~/log"
import {
  routeGroupProfiles,
  routeGroupSingleProfile,
  routes,
  Source as RouterSource,
  push,
  replace,
} from "~/router"
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

  const guardRedirectToAuth$ = history$.pipe(
    withLatestFrom(me$),
    filter(([route, me]) => routeGroupProfiles.has(route) && isLurking(me)),
    map((_) => push(routes.in())),
    tag(`guardRedirectToAuth$`),
    share()
  )

  const localState$ = action$.pipe(
    switchMap((action) =>
      match(action)
        .with({ type: Actions.showProfile }, () => of(State.show))
        .with({ type: Actions.editProfile }, () => of(State.edit))
        .otherwise(() => EMPTY)
    ),
    tag("localState$"),
    shareLatest()
  )

  const state$ = history$.pipe(
    map((route) =>
      match(route)
        .when(
          (route) => routeGroupSingleProfile.has(route),
          () => State.show
        )
        .with({ name: routes.me.name }, () => State.show)
        .otherwise(() => State.pending)
    ),
    mergeWith(localState$),
    distinctUntilChanged(),
    tag("state$"),
    shareLatest()
  )

  const edit = Edit(sources, tagScope)
  const { editedProfile$ } = edit.value
  const show = Show(
    {
      ...sources,
      props: {
        editedProfile$,
      },
    },
    tagScope
  )

  const react = state$.pipe(
    switchMap((state) =>
      match(state)
        .with(State.show, () => show.react)
        .with(State.edit, () => edit.react)
        .with(State.pending, () => EMPTY)
        .exhaustive()
    ),
    tag("react"),
    share()
  )

  const action = merge(...pluck("action", [edit, show]))
  const notice = merge(...pluck("notice", [edit, show]))
  const router = merge(...pluck("router", [show]), guardRedirectToAuth$)
  const track = merge(...pluck("track", [show, edit]))

  return {
    react,
    action,
    notice,
    router,
    track,
  }
}
