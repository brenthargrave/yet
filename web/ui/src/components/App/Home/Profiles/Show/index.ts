import { h, ReactSource } from "@cycle/react"
import { of } from "ramda"
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
import { filterResultOk } from "ts-results/rxjs-operators"
import { Source as ActionSource } from "~/action"
import { getProfile$, Profile, Source as GraphSource } from "~/graph"
import { makeTagger } from "~/log"
import { routes, Source as RouterSource } from "~/router"
import { shareLatest, cb$ } from "~/rx"
import { View, State } from "./View"

export interface Sources {
  react: ReactSource
  router: RouterSource
  graph: GraphSource
  action: ActionSource
}

export const Show = (sources: Sources, tagPrefix?: string) => {
  const tagScope = `${tagPrefix}/Show`
  const tag = makeTagger(tagScope)

  const {
    router: { history$ },
    graph: { me$: _me$ },
  } = sources
  const me$ = _me$.pipe(filter(isNotNullish), tag("me$"))

  const [onClickEdit, clickEdit$] = cb$(tag("clickEdit$"))
  // const newConvo$ = clickEdit$.pipe(
  //   map(() => push(routes.conversation({ id: NEWID })))
  // )

  const id$ = combineLatest({ route: history$, me: me$ }).pipe(
    switchMap(({ route, me: { id } }) =>
      route.name === routes.me.name ? of(id) : EMPTY
    ),
    tag("id$"),
    shareLatest()
  )

  const result$ = id$.pipe(
    switchMap((id) => getProfile$({ id })),
    tag("result$"),
    shareLatest()
  )

  const profile$: Observable<Profile> = result$.pipe(
    //
    filterResultOk(),
    tag("profile$"),
    share()
  )

  const state$ = profile$.pipe(
    map(() => State.ready),
    startWith(State.loading),
    distinctUntilChanged(),
    tag("THIS state$"),
    shareLatest()
  )

  const props$ = combineLatest({
    state: state$,
    viewer: me$,
    profile: profile$,
  }).pipe(tag("props$"), shareLatest())

  const cbs = [onClickEdit]
  const react = props$.pipe(map((props) => h(View, { ...props, ...cbs })))

  // const router = merge(newConvo$, showConvo$)

  return {
    react,
    // router,
  }
}
