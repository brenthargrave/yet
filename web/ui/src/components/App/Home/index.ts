import { h, ReactSource } from "@cycle/react"
import {
  combineLatest,
  delay,
  distinctUntilChanged,
  EMPTY,
  map,
  merge,
  mergeMap,
  of,
  share,
  startWith,
  switchMap,
  withLatestFrom,
} from "rxjs"
import { match } from "ts-pattern"
import { ulid } from "ulid"
import { Actions, Source as ActionSource } from "~/action"
import { Onboarding } from "~/components/Onboarding"
import { isEmpty, pluck } from "~/fp"
import {
  EventName,
  FromView,
  isAuthenticated,
  isOnboarding,
  Source as GraphSource,
  track$,
} from "~/graph"
import { makeTagger } from "~/log"
import {
  anyConversationsRouteGroup,
  anyPotentialEditRouteGroup,
  anyRootOppsRouteGroup,
  NEWID,
  push,
  routeGroupPayments,
  routeGroupProfiles,
  routes,
  Source as RouterSource,
} from "~/router"
import { cb$, mapTo, shareLatest } from "~/rx"
import { redirectToAuth$ } from "~/system"
import { Conversations } from "./Conversations"
import { Location, Opps, State as OppsState } from "./Opps"
import { Payments } from "./Payments"
import { Profiles } from "./Profiles"
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
  profiles = "profile",
  payments = "payments",
}

interface Sources {
  react: ReactSource
  router: RouterSource
  graph: GraphSource
  action: ActionSource
}

export const Home = (sources: Sources, tagPrefix?: string) => {
  const tagScope = `${tagPrefix}/Home`
  const tag = makeTagger(tagScope)

  const {
    graph: { me$, opps$ },
    router: { history$ },
  } = sources

  // NOTE: force onboarding everywhere in main app after auth
  const onboarding = Onboarding(sources, tagScope)
  const conversations = Conversations(sources, tagScope)
  const timeline = Timeline(sources, tagScope)
  const profiles = Profiles(sources, tagScope)
  const payments = Payments(sources, tagScope)

  const oppsState$ = history$.pipe(
    switchMap((route) =>
      match(route)
        .with({ name: routes.opps.name }, () => of(OppsState.list))
        .with({ name: routes.opp.name }, ({ params: { oid } }) =>
          of(oid === NEWID ? OppsState.create : OppsState.single)
        )
        .otherwise(() => EMPTY)
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
    switchMap((action) =>
      match(action)
        .with({ type: Actions.listOpps }, () => of(push(routes.opps())))
        .with({ type: Actions.createOpp }, () =>
          of(push(routes.opp({ oid: NEWID })))
        )
        .with({ type: Actions.showOpp }, ({ opp }) =>
          of(push(routes.opp({ oid: opp.id })))
        )
        .with({ type: Actions.createPayment }, ({ opp }) =>
          of(push(routes.newOppPayment({ oid: opp.id, pid: ulid() })))
        )
        .otherwise(() => EMPTY)
    ),
    tag("oppsRouter$")
  )

  const [onClickHome, onClickHome$] = cb$(tag("onClickHome$"))
  const [onClickConversations, onClickConvos$] = cb$(tag("onClickConvos$"))
  const [onClickOpps, onClickOpps$] = cb$(tag("onClickOpps$"))
  const [onClickProfile, onClickProfile$] = cb$(tag("onClickProfile$"))
  const [onClickNew, clickNew$] = cb$(tag("clickNew$"))

  // TODO: extract, share across components (Convo/Empty views)
  const newConvo$ = clickNew$.pipe(
    mapTo(push(routes.conversation({ id: NEWID })))
  )
  const trackNew$ = clickNew$.pipe(
    withLatestFrom(me$),
    mergeMap(([_, me]) =>
      track$({
        customerId: me?.id,
        name: EventName.TapNewConversation,
        properties: {
          view: FromView.Nav,
        },
      })
    )
  )

  const rootRouter$ = merge(
    onClickHome$.pipe(mapTo(push(routes.root()))),
    onClickConvos$.pipe(mapTo(push(routes.conversations()))),
    onClickOpps$.pipe(mapTo(push(routes.opps()))),
    onClickProfile$.pipe(mapTo(push(routes.me())))
  ).pipe(tag("rootRouter$"), share())

  const rootState$ = history$
    .pipe(
      map((route) =>
        match(route)
          .when(
            (route) => routeGroupProfiles.has(route),
            () => RootState.profiles
          )
          .when(
            (route) => anyConversationsRouteGroup.has(route),
            () => RootState.conversations
          )
          .when(
            (route) => anyRootOppsRouteGroup.has(route),
            () => RootState.opps
          )
          .when(
            (route) => routeGroupPayments.has(route),
            () => RootState.payments
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

  const showHomeOnly$ = me$.pipe(
    map((me) => !isAuthenticated(me)),
    startWith(true),
    distinctUntilChanged(),
    tag("showHomeOnly$"),
    shareLatest()
  )

  const props$ = combineLatest({
    showHomeOnly: showHomeOnly$,
    viewer: me$,
  }).pipe(tag("props$"), shareLatest())

  const subview$ = rootState$.pipe(
    switchMap((state) =>
      match(state)
        .with(RootState.timeline, () => timeline.react)
        .with(RootState.conversations, () => conversations.react)
        .with(RootState.opps, () => opps.react)
        .with(RootState.profiles, () => profiles.react)
        .with(RootState.payments, () => payments.react)
        .exhaustive()
    ),
    tag("subview$"),
    share()
  )

  const rootView$ = combineLatest({ subview: subview$, props: props$ }).pipe(
    map(({ subview, props }) =>
      h(
        View,
        {
          ...props,
          onClickConversations,
          onClickOpps,
          onClickHome,
          onClickProfile,
          onClickNew,
        },
        [subview]
      )
    ),
    tag("rootView$")
  )

  const state$ = combineLatest({ me: me$ }).pipe(
    map(({ me }) => {
      return isAuthenticated(me) && isOnboarding(me)
        ? State.onboarding
        : State.root
    }),
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
    ...pluck("router", [conversations, timeline, profiles, payments]),
    rootRouter$,
    oppsRouter$,
    redirectToAuth$,
    newConvo$
  )
  const track = merge(
    ...pluck("track", [conversations, timeline, profiles, onboarding]),
    trackNew$
  )
  const notice = merge(
    ...pluck("notice", [conversations, opps, onboarding, profiles, payments])
  )
  const graph = merge(...pluck("graph", [conversations]))
  const action = merge(...pluck("action", [opps, conversations, profiles]))

  return {
    react,
    router,
    track,
    notice,
    graph,
    action,
  }
}
