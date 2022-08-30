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
import { filterResultOk } from "ts-results/rxjs-operators"
import { Source as ActionSource } from "~/action"
import { getProfile$, Profile, Source as GraphSource } from "~/graph"
import { makeTagger } from "~/log"
import { routes, Source as RouterSource } from "~/router"
import { shareLatest, cb$ } from "~/rx"
import { State, View } from "./View"

export interface Sources {
  react: ReactSource
  router: RouterSource
  graph: GraphSource
  action: ActionSource
}

export const Profiles = (sources: Sources, tagPrefix?: string) => {
  const tagScope = `${tagPrefix}/Timeline`
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

  // const [onClickConversation, clickConvo$] = cb$<Conversation>(tag("clickNew$"))
  // const showConvo$ = clickConvo$.pipe(
  //   map(({ id }) => push(routes.conversation({ id })))
  // )

  const result$ = combineLatest({ route: history$, me: me$ }).pipe(
    switchMap(({ route, me }) =>
      route.name === routes.profile.name ? getProfile$({ id: me.id }) : EMPTY
    ),
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
    tag("state$"),
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
