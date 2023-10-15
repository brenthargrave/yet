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
  of,
  pluck,
  share,
  startWith,
  switchMap,
  tap,
  withLatestFrom,
} from "rxjs"
import { isNotNullish } from "rxjs-etc"
import { match, P } from "ts-pattern"
import { filterResultOk } from "ts-results/rxjs-operators"
import { act, Actions, Source as ActionSource } from "~/action"
import { SocialProfile } from "~/components/App/SocialProfile"
import {
  Conversation,
  EventName,
  FromView,
  getProfile$,
  GetProfileInput,
  ID,
  ProfileExtended,
  Source as GraphSource,
  TimelineFilters,
  track$,
} from "~/graph"
import { makeTagger } from "~/log"
import { info } from "~/notice"
import {
  NEWID,
  push,
  routeGroupSingleProfile,
  routes,
  Source as RouterSource,
  toURL,
} from "~/router"
import { cb$, mapTo, shareLatest } from "~/rx"
import { MuteButton } from "./MuteButton"
import { ProfileTab } from "./ProfileTabs"
import { State, View } from "./View"

interface Props {
  editedProfile$: Observable<ProfileExtended>
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

  const _getProfile$ = (pid: ID) => {
    const timelineFilters: TimelineFilters = { onlyWith: pid }
    const profileInput: GetProfileInput = { id: pid, timelineFilters }
    return getProfile$(profileInput).pipe(
      filterResultOk(),
      tag("getProfile$"),
      share()
    )
  }

  const profile$ = history$.pipe(
    switchMap((route) =>
      match(route)
        .with({ name: routes.me.name }, () => myProfile$)
        .with({ name: routes.profile.name }, ({ params: { pid } }) =>
          _getProfile$(pid)
        )
        .with({ name: routes.profileContacts.name }, ({ params: { pid } }) =>
          _getProfile$(pid)
        )
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

  const defaultTab = history$.pipe(
    filter((route) => routeGroupSingleProfile.has(route)),
    map((route) =>
      match(route)
        .with({ name: routes.profileContacts.name }, () => ProfileTab.Contacts)
        .otherwise(() => ProfileTab.Activity)
    ),
    startWith(ProfileTab.Activity),
    tag("defaultTab"),
    shareLatest()
  )

  const [onClickShareContacts, onClickShareContacts$] = cb$(
    tag("onClickShareContacts$")
  )
  const clickShareContacts$ = onClickShareContacts$.pipe(
    withLatestFrom(profile$),
    map(([_, p]) => toURL(routes.profileContacts({ pid: p.id }).href)),
    tap((href) => navigator.clipboard.writeText(href)),
    mapTo(info({ description: "Contacts URL copied!" })),
    tag("clickShareContacts$")
  )

  const [onClickShareProfile, onClickShareProfile$] = cb$(
    tag("onClickShareProfile$")
  )
  const clickShareProfile$ = onClickShareProfile$.pipe(
    withLatestFrom(profile$),
    map(([_, p]) => toURL(routes.profile({ pid: p.id }).href)),
    tap((href) => navigator.clipboard.writeText(href)),
    mapTo(info({ description: "Profile URL copied!" })),
    tag("clickShareProfile$")
  )

  const props$ = combineLatest({
    state: state$,
    viewer: me$,
    profile: profile$,
    events: events$,
    contacts: contacts$,
    muteButton: muteButton.react,
    defaultTab,
  }).pipe(tag("props$"), shareLatest())

  const react = props$.pipe(
    map((props) =>
      h(View, {
        ...props,
        onClickEdit,
        onClickNewConversation,
        onClickConversation,
        onClickSocial,
        onClickShareProfile,
        onClickShareContacts,
      })
    )
  )
  const action = merge(edit$)
  const router = merge(newConversation$, showConv$)
  const track = merge(trackNewConvo$, social.track)
  const notice = merge(
    //
    muteButton.notice,
    clickShareContacts$,
    clickShareProfile$
  )

  return {
    react,
    action,
    router,
    track,
    notice,
  }
}
