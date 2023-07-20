import { h, ReactSource } from "@cycle/react"
import {
  combineLatest,
  distinctUntilChanged,
  EMPTY,
  filter,
  map,
  merge,
  mergeMap,
  share,
  startWith,
  switchMap,
  Observable,
  withLatestFrom,
} from "rxjs"
import { isNotNullish } from "rxjs-etc"
import { match } from "ts-pattern"
import { filterResultOk } from "ts-results/rxjs-operators"
import { act, Actions, Source as ActionSource } from "~/action"
import { SocialProfile } from "~/components/App/SocialProfile"
import {
  Conversation,
  EventName,
  FromView,
  getProfile$,
  Source as GraphSource,
  track$,
  Profile,
  TimelineFilters,
  GetProfileInput,
} from "~/graph"
import { makeTagger } from "~/log"
import { NEWID, push, routes, Source as RouterSource } from "~/router"
import { cb$, shareLatest } from "~/rx"
import { State, View } from "./View"

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
    graph: { me$: _me$, profile$: _profile$ },
    router: { history$ },
  } = sources
  const me$ = _me$.pipe(filter(isNotNullish), tag("me$"))

  const profile$ = history$.pipe(
    switchMap((route) =>
      match(route)
        .with({ name: routes.me.name }, () => _profile$)
        .with({ name: routes.profile.name }, ({ params: { pid } }) => {
          const timelineFilters: TimelineFilters = { onlyWith: pid }
          const profileInput: GetProfileInput = { id: pid, timelineFilters }
          return getProfile$(profileInput).pipe(filterResultOk())
        })
        .otherwise(() => EMPTY)
    ),
    tag("profile$"),
    shareLatest()
  )

  const state$ = profile$.pipe(
    map(() => State.ready),
    startWith(State.loading),
    distinctUntilChanged(),
    tag("state$"),
    shareLatest()
  )

  const [onClickEdit, onClickEdit$] = cb$(tag("clickEdit$"))
  const edit$ = onClickEdit$.pipe(
    map(() => act(Actions.editProfile)),
    tag("edit$"),
    share()
  )

  const [onClickNewConversation, onClickNew$] = cb$(tag("clickNew$"))
  const newConversation$ = onClickNew$.pipe(
    map(() => push(routes.conversation({ id: NEWID }))),
    tag("new$"),
    share()
  )
  const trackNewConvo$ = onClickNew$.pipe(
    withLatestFrom(me$),
    mergeMap(([_, me]) =>
      track$({
        name: EventName.TapNewConversation,
        properties: {
          signatureCount: me?.stats?.signatureCount,
          view: FromView.Profile,
        },
        customerId: me?.id,
      })
    )
  )

  const [onClickConversation, onClickConv$] = cb$<Conversation>(
    tag("clickNew$")
  )
  const showConv$ = onClickConv$.pipe(
    map((c) => push(routes.conversation({ id: c.id }))),
    tag("clickConversation$"),
    share()
  )

  const social = SocialProfile(
    {
      ...sources,
      props: { profile$, from: FromView.Profile },
    },
    tagScope
  )
  const { onClickSocial } = social.value

  const props$ = combineLatest({
    state: state$,
    viewer: me$,
    profile: profile$,
  }).pipe(tag("props$"), shareLatest())

  const react = props$.pipe(
    map((props) =>
      h(View, {
        ...props,
        onClickEdit,
        onClickNewConversation,
        onClickConversation,
        onClickSocial,
      })
    )
  )
  const action = merge(edit$)
  const router = merge(newConversation$, showConv$)
  const track = merge(trackNewConvo$, social.track)

  return {
    react,
    action,
    router,
    track,
  }
}
