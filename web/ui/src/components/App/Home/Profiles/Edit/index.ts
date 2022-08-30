import { h, ReactSource } from "@cycle/react"
import { of } from "ramda"
import {
  combineLatest,
  distinctUntilChanged,
  EMPTY,
  filter,
  map,
  merge,
  Observable,
  share,
  startWith,
  switchMap,
  withLatestFrom,
} from "rxjs"
import { isNotNullish } from "rxjs-etc"
import { Action } from "rxjs/internal/scheduler/Action"
import { filterResultOk } from "ts-results/rxjs-operators"
import { act, Actions, Source as ActionSource } from "~/action"
import { getProfile$, Profile, Source as GraphSource } from "~/graph"
import { makeTagger } from "~/log"
import { routes, Source as RouterSource } from "~/router"
import { shareLatest, cb$ } from "~/rx"
// import { View, State } from "./View"

export interface Sources {
  react: ReactSource
  router: RouterSource
  graph: GraphSource
  action: ActionSource
}

export const Edit = (sources: Sources, tagPrefix?: string) => {
  const tagScope = `${tagPrefix}/Show`
  const tag = makeTagger(tagScope)

  const {
    router: { history$ },
    graph: { me$: _me$ },
  } = sources
  const me$ = _me$.pipe(filter(isNotNullish), tag("me$"))

  // const id$ = combineLatest({ route: history$, me: me$ }).pipe(
  //   switchMap(({ route, me: { id } }) =>
  //     route.name === routes.me.name ? of(id) : EMPTY
  //   ),
  //   tag("id$"),
  //   shareLatest()
  // )

  // const [onClickEdit, onClickEdit$] = cb$(tag("clickEdit$"))
  // const edit$ = onClickEdit$.pipe(
  //   // withLatestFrom(id$),
  //   // map(([_, id]) => act(Actions.editOpp, { id })),
  //   map(() => act(Actions.editOpp)),
  //   tag("edit$"),
  //   share()
  // )

  // const result$ = id$.pipe(
  //   switchMap((id) => getProfile$({ id })),
  //   tag("result$"),
  //   shareLatest()
  // )

  // const profile$: Observable<Profile> = result$.pipe(
  //   //
  //   filterResultOk(),
  //   tag("profile$"),
  //   share()
  // )

  // const state$ = profile$.pipe(
  //   map(() => State.ready),
  //   startWith(State.loading),
  //   distinctUntilChanged(),
  //   tag("THIS state$"),
  //   shareLatest()
  // )

  // const props$ = combineLatest({
  //   state: state$,
  //   viewer: me$,
  //   profile: profile$,
  // }).pipe(tag("props$"), shareLatest())

  // const react = props$.pipe(map((props) => h(View, { ...props, onClickEdit })))
  const react = of(null)

  // const action = merge(edit$)

  return {
    react,
    // action,
  }
}
