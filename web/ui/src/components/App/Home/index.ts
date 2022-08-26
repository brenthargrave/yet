import { h, ReactSource } from "@cycle/react"
import {
  combineLatest,
  delay,
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
import { isEmpty, pluck } from "~/fp"
import { isAuthenticated, isOnboarding, Source as GraphSource } from "~/graph"
import { makeTagger } from "~/log"
import {
  anyConversationsRouteGroup,
  anyPotentialEditRouteGroup,
  anyRootOppsRouteGroup,
  NEWID,
  push,
  routes,
  Source as RouterSource,
} from "~/router"
import { cb$, mapTo, shareLatest } from "~/rx"
import { Conversations } from "./Conversations"
import { Location, Opps, State as OppsState } from "./Opps"
import { Timeline } from "./Timeline"
import { View } from "./View"

enum State {
  onboarding = "onboarding",
  root = "root",
}

enum RootState {
  conversations = "conversations",
  opps = "opps",
  timeline = "timeline",
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
    graph: { me$, opps$ },
    router: { history$ },
  } = sources

  // NOTE: force onboarding everywhere in main app after auth
  const onboarding = Onboarding(sources)
  const conversations = Conversations(sources, tagScope)
  const timeline = Timeline(sources, tagScope)

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

  const [onClickHome, onClickHome$] = cb$(tag("onClickHome$"))
  const [onClickConversations, onClickConvos$] = cb$(tag("onClickConvos$"))
  const [onClickOpps, onClickOpps$] = cb$(tag("onClickOpps$"))

  const rootRouter$ = merge(
    onClickHome$.pipe(mapTo(push(routes.root()))),
    onClickConvos$.pipe(mapTo(push(routes.conversations()))),
    onClickOpps$.pipe(mapTo(push(routes.opps())))
  ).pipe(tag("rootRouter$"), share())

  const rootState$ = history$
    .pipe(
      map((route) =>
        match(route)
          .with({ name: routes.root.name }, () => RootState.timeline)
          .when(
            (route) => anyConversationsRouteGroup.has(route),
            () => RootState.conversations
          )
          .when(
            (route) => anyRootOppsRouteGroup.has(route),
            () => RootState.opps
          )
          .otherwise(() => RootState.timeline)
      )
    )
    .pipe(
      startWith(RootState.conversations),
      distinctUntilChanged(),
      tag("rootState$"),
      shareLatest()
    )

  const hasOpps$ = opps$.pipe(
    map((opps) => !isEmpty(opps)),
    startWith(false),
    distinctUntilChanged(),
    tag("hasOpps$"),
    shareLatest()
  )

  const isEditing$ = history$.pipe(
    delay(90),
    map((route) =>
      match(route)
        .when(
          anyPotentialEditRouteGroup.has,
          () => !!document.getElementById("edit")
        )
        .otherwise(() => false)
    ),
    startWith(false),
    tag("isEditing$"),
    shareLatest()
  )

  const showMenu$ = combineLatest({
    hasOpps: hasOpps$,
    isEditing: isEditing$,
  }).pipe(
    map(({ hasOpps, isEditing }) => hasOpps && !isEditing),
    startWith(false),
    distinctUntilChanged(),
    tag("showMenu$"),
    shareLatest()
  )

  const props$ = combineLatest({
    showMenu: showMenu$,
  }).pipe(tag("props$"))

  const subview$ = rootState$.pipe(
    switchMap((state) =>
      match(state)
        .with(RootState.timeline, () => timeline.react)
        .with(RootState.conversations, () => conversations.react)
        .with(RootState.opps, () => opps.react)
        .exhaustive()
    ),
    tag("subview$")
  )

  const rootView$ = combineLatest({ subview: subview$, props: props$ }).pipe(
    map(({ subview, props }) =>
      h(View, { ...props, onClickConversations, onClickOpps, onClickHome }, [
        subview,
      ])
    ),
    tag("rootView$")
  )

  const state$ = combineLatest({ me: me$ }).pipe(
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

  const router = merge(
    ...pluck("router", [conversations, timeline]),
    rootRouter$,
    oppsRouter$
  )
  const track = merge(...pluck("track", [conversations]))
  const notice = merge(...pluck("notice", [conversations, opps, onboarding]))
  const graph = merge(...pluck("graph", [conversations]))

  return {
    react,
    router,
    track,
    notice,
    graph,
  }
}
