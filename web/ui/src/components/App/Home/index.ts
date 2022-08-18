import { h, ReactSource } from "@cycle/react"
import {
  combineLatest,
  distinctUntilChanged,
  EMPTY,
  map,
  merge,
  of,
  share,
  startWith,
  switchMap,
} from "rxjs"
import { match } from "ts-pattern"
import { Actions, Source as ActionSource } from "~/action"
import { Onboarding } from "~/components/Onboarding"
import { isAuthenticated, isOnboarding, Source as GraphSource } from "~/graph"
import { makeTagger } from "~/log"
import { NEWID, push, routes, Source as RouterSource } from "~/router"
import { Conversations } from "./Conversations"
import { View } from "./View"
import { isPresent, pluck } from "~/fp"
import { cb$, mapTo, shareLatest } from "~/rx"
import { Opps, State as OppsState, Location } from "./Opps"

enum State {
  onboarding = "onboarding",
  root = "root",
}
enum RootState {
  conversations = "conversations",
  opps = "opps",
}

interface Sources {
  react: ReactSource
  router: RouterSource
  graph: GraphSource
  action: ActionSource
}

export const Home = (sources: Sources) => {
  const tagScope = "Home"
  const tag = makeTagger(tagScope)

  const {
    graph: { me$: me, opps$ },
    router: { history$ },
  } = sources

  // NOTE: force onboarding everywhere in main app after auth
  const onboarding = Onboarding(sources)
  const conversations = Conversations(sources, tagScope)

  const oppsState$ = history$.pipe(
    map((route) =>
      match(route)
        .with({ name: routes.opps.name }, () => OppsState.list)
        .with({ name: routes.opp.name }, ({ params: { oid } }) =>
          oid === NEWID ? OppsState.create : OppsState.single
        )
        .otherwise(() => OppsState.list)
    ),
    distinctUntilChanged(),
    tag("oppsState$"),
    shareLatest()
  )

  const oppID$ = history$.pipe(
    switchMap((route) =>
      match(route)
        .with({ name: routes.opp.name }, ({ params: { oid } }) =>
          oid === NEWID ? EMPTY : of(oid)
        )
        .otherwise(() => EMPTY)
    ),
    tag("oppID$"),
    shareLatest()
  )

  const opps = Opps(
    {
      ...sources,
      props: {
        location: Location.home,
        state$: oppsState$,
        id$: oppID$,
      },
    },
    tagScope
  )

  const oppsRouter$ = opps.action.pipe(
    map((action) =>
      match(action)
        .with({ type: Actions.listOpps }, () => push(routes.opps()))
        .with({ type: Actions.createOpp }, () =>
          push(routes.opp({ oid: NEWID }))
        )
        .with({ type: Actions.showOpp }, ({ opp }) =>
          push(routes.opp({ oid: opp.id }))
        )
        .run()
    ),
    tag("oppsRouter$")
  )

  const [onClickConversations, onClickConvos$] = cb$(tag("onClickConvos$"))
  const [onClickOpps, onClickOpps$] = cb$(tag("onClickOpps$"))
  const rootState$ = merge(
    onClickConvos$.pipe(mapTo(RootState.conversations)),
    onClickOpps$.pipe(mapTo(RootState.opps))
  ).pipe(
    // TODO:
    // startWith(RootState.conversations),
    startWith(RootState.opps),
    distinctUntilChanged(),
    tag("rootState$"),
    shareLatest()
  )

  const isVisible$ = opps$.pipe(
    map(isPresent),
    startWith(false),
    distinctUntilChanged(),
    tag("isVisible$"),
    shareLatest()
  )

  const props$ = combineLatest({
    isVisible: isVisible$,
  }).pipe(tag("props$"))

  const subview$ = rootState$.pipe(
    switchMap((state) =>
      match(state)
        .with(RootState.conversations, () => conversations.react)
        .with(RootState.opps, () => opps.react)
        .exhaustive()
    ),
    tag("subview$")
  )

  const rootView$ = combineLatest({ subview: subview$, props: props$ }).pipe(
    map(({ subview, props }) =>
      h(View, { ...props, onClickConversations, onClickOpps }, [subview])
    ),
    tag("rootState$")
  )

  const state$ = combineLatest({ me }).pipe(
    map(({ me }) =>
      isAuthenticated(me) && isOnboarding(me) ? State.onboarding : State.root
    ),
    distinctUntilChanged(),
    tag("state$"),
    share()
  )

  const react = state$.pipe(
    switchMap((state) =>
      match(state)
        .with(State.onboarding, () => onboarding.react)
        .with(State.root, () => rootView$)
        .exhaustive()
    ),
    tag("react"),
    share()
  )

  const router = merge(...pluck("router", [conversations]), oppsRouter$)
  const track = merge(...pluck("track", [conversations]))
  const notice = merge(...pluck("notice", [conversations, opps]))
  const graph = merge(...pluck("graph", [conversations]))

  return {
    react,
    router,
    track,
    notice,
    graph,
  }
}
