import { h, ReactSource } from "@cycle/react"
import {
  combineLatest,
  distinctUntilChanged,
  EMPTY,
  filter,
  map,
  merge,
  mergeMap,
  Observable,
  pluck,
  share,
  startWith,
  switchMap,
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
  GetProfileInput,
  Profile,
  ProfileExtended,
  Source as GraphSource,
  TimelineFilters,
  track$,
} from "~/graph"
import { makeTagger } from "~/log"
import { NEWID, push, routes, Source as RouterSource } from "~/router"
import { cb$, shareLatest } from "~/rx"
import { MuteButton } from "./MuteButton"
import { State, View } from "./View"

interface Props {
  editedProfile$: Observable<Profile>
}

export interface Sources {
  props: Props
  react: ReactSource
  router: RouterSource
  graph: GraphSource
  action: ActionSource
}

export const Show = (sources: Sources, tagPrefix?: string) => {
  const tagScope = `${tagPrefix}/Show`
  const tag = makeTagger(tagScope)

  const {
    graph: { me$: _me$, profile$: initialProfile$ },
    router: { history$ },
    props: { editedProfile$: _editedProfile$ },
  } = sources

  const editedProfile$ = _editedProfile$.pipe(
    withLatestFrom(initialProfile$),
    map(([edited, initial]) => {
      return {
        ...initial,
        ...edited,
      } as ProfileExtended
    }),
    tag("editedProfile$ (merged w/ initial)"),
    share()
  )

  const me$ = _me$.pipe(filter(isNotNullish), tag("me$"))
  const myProfile$ = merge(initialProfile$, editedProfile$).pipe(
    tag("myProfile$"),
    shareLatest()
  )

  const profile$ = history$.pipe(
    switchMap((route) =>
      match(route)
        .with({ name: routes.me.name }, () => myProfile$)
        .with({ name: routes.profile.name }, ({ params: { pid } }) => {
          const timelineFilters: TimelineFilters = { onlyWith: pid }
          const profileInput: GetProfileInput = { id: pid, timelineFilters }
          return getProfile$(profileInput).pipe(
            filterResultOk(),
            tag("getProfile$"),
            share()
          )
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

  const events$ = profile$.pipe(
    pluck("events"),
    filter(isNotNullish),
    startWith([]),
    tag("events$"),
    shareLatest()
  )
  const contacts$ = profile$.pipe(
    pluck("contacts"),
    filter(isNotNullish),
    startWith([]),
    tag("contacts$"),
    shareLatest()
  )

  const muteButton = MuteButton(
    {
      ...sources,
      props: {
        me$,
        profile$,
      },
    },
    tagPrefix
  )

  const props$ = combineLatest({
    state: state$,
    viewer: me$,
    profile: profile$,
    events: events$,
    contacts: contacts$,
    muteButton: muteButton.react,
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
  const notice = merge(muteButton.notice)

  return {
    react,
    action,
    router,
    track,
    notice,
  }
}
