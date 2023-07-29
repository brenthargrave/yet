import { h, ReactSource } from "@cycle/react"
import { pluck } from "ramda"
import {
  combineLatest,
  distinctUntilChanged,
  distinctUntilKeyChanged,
  EMPTY,
  filter,
  map,
  merge,
  mergeMap,
  Observable,
  of,
  pluck as pluck$,
  share,
  startWith,
  switchMap,
  withLatestFrom,
} from "rxjs"
import { isNotNullish } from "rxjs-etc"
import { match } from "ts-pattern"
import { filterResultErr, filterResultOk } from "ts-results/rxjs-operators"
import { Source as ActionSource } from "~/action"
import { ErrorView } from "~/components/App/ErrorView"
import {
  Conversation,
  ErrorCode,
  EventName,
  getConversation$,
  Intent,
  isCreatedBy,
  noteAdded$,
  noteAddedNotice,
  partitionError$,
  Source as GraphSource,
  subscribeConversation$,
  track$,
} from "~/graph"
import { makeTagger } from "~/log"
import { info } from "~/notice"
import {
  NEWID,
  push,
  routes,
  singleConversationRoutesGroup,
  Source as RouterSource,
} from "~/router"
import { noticeFromError$, shareLatest } from "~/rx"
import { Main as Edit } from "./Edit"
import { Join } from "./Join"
import { Show } from "./Show"
import { View } from "./View"

export enum State {
  pending = "pending",
  edit = "edit",
  show = "show",
  join = "join",
}

interface Sources {
  react: ReactSource
  router: RouterSource
  graph: GraphSource
  action: ActionSource
}

export const Single = (sources: Sources, tagPrefix?: string) => {
  const tagScope = `${tagPrefix}/Single`
  const tag = makeTagger(tagScope)

  const {
    router: { history$ },
    graph: { me$ },
  } = sources

  const id$ = history$.pipe(
    switchMap((route) =>
      match(route)
        .when(singleConversationRoutesGroup.has, ({ params: { id } }) =>
          id === NEWID ? EMPTY : of(id)
        )
        .otherwise(() => EMPTY)
    ),
    distinctUntilChanged(),
    tag("id$"),
    shareLatest()
  )

  const result$ = id$.pipe(
    switchMap((id) => getConversation$(id)),
    tag("result$"),
    share()
  )

  const record$ = result$.pipe(filterResultOk(), tag("record$"), shareLatest())

  const liveRecordResult$ = id$.pipe(
    distinctUntilChanged(),
    switchMap((id) => subscribeConversation$({ id })),
    tag("liveRecordResult$"),
    share()
  )

  const liveRecordErrorNotice$ = noticeFromError$(
    liveRecordResult$.pipe(
      filterResultErr(),
      tag("liveRecordErrorNotice$"),
      share()
    )
  )

  const liveRecord$ = liveRecordResult$.pipe(
    filterResultOk(),
    tag("liveRecord$"),
    shareLatest()
  )

  const mergedRecord$ = merge(record$, liveRecord$).pipe(
    tag("mergedRecord$"),
    shareLatest()
  )

  const error$ = result$.pipe(filterResultErr(), tag("error$"), share())
  const errorNotice$ = noticeFromError$(error$)
  const { userError$, appError$ } = partitionError$(error$)

  const redirectNotFound$ = userError$.pipe(
    filter(({ code }) => code === ErrorCode.NotFound),
    map((_) => push(routes.conversations())),
    tag("redirectNotFound$"),
    share()
  )

  const isLoading$ = combineLatest({ id: id$, record: record$ }).pipe(
    map(({ id, record }) => record.id !== id),
    startWith(true),
    tag("isLoading$"),
    shareLatest()
  )

  const state$ = combineLatest({
    isLoading: isLoading$,
    record: record$,
    route: history$,
    me: me$,
  }).pipe(
    map(({ isLoading, record, route, me }) =>
      isLoading
        ? State.pending
        : match(route)
            .with({ name: routes.joinConversation.name }, () => State.join)
            .when(singleConversationRoutesGroup.has, ({ params: { id } }) => {
              const isCreator = isCreatedBy(record, me)
              return isCreator ? State.edit : State.show
            })
            .otherwise(() => State.pending)
    ),
    startWith(State.pending),
    distinctUntilChanged(),
    tag("state$"),
    shareLatest()
  )

  const stateRecord$ = (state: State, record$: Observable<Conversation>) => {
    return combineLatest({
      currentState: state$,
      record: record$,
    }).pipe(
      map(({ record, currentState }) =>
        currentState === state ? record : null
      ),
      filter(isNotNullish),
      tag("stateRecord$"),
      shareLatest()
    )
  }

  const join = Join(
    {
      ...sources,
      props: { record$: stateRecord$(State.join, mergedRecord$) },
    },
    tagScope
  )

  const show = Show(
    {
      ...sources,
      props: { record$: stateRecord$(State.show, mergedRecord$) },
    },
    tagScope
  )

  const edit = Edit(
    {
      ...sources,
      props: {
        record$: stateRecord$(State.edit, record$),
        liveRecord$: stateRecord$(State.edit, liveRecord$),
      },
    },
    tagScope
  )

  const mapStateToIntent = (state: State): Intent =>
    match(state)
      .with(State.edit, () => Intent.Edit)
      .with(State.show, () => Intent.View)
      .with(State.join, () => Intent.Join)
      .otherwise((state) => {
        throw new Error(`No intent for state: ${state}`)
      })

  const trackView$ = record$.pipe(
    distinctUntilKeyChanged("id"),
    withLatestFrom(state$, me$),
    filter(([_record, state, _me]) => state !== State.pending),
    mergeMap(([record, state, me]) =>
      track$({
        name: EventName.ViewConversation,
        customerId: me?.id,
        properties: {
          intent: mapStateToIntent(state),
        },
      })
    ),
    tag("trackView$"),
    share()
  )

  const addedNote$ = mergedRecord$.pipe(
    pluck$("id"),
    distinctUntilChanged(),
    switchMap((conversationId) => noteAdded$({ conversationId })),
    filterResultOk(),
    tag("addedNote$"),
    share()
  )

  const noticeAddedNote$ = addedNote$.pipe(
    withLatestFrom(me$),
    switchMap(([note, me]) => {
      // skip if own note
      return note.creator?.id === me?.id
        ? EMPTY
        : of(info({ description: noteAddedNotice(note) }))
    }),
    tag("noticeAddedNote$"),
    share()
  )

  const react = merge(
    userError$.pipe(map((error) => h(ErrorView, { error }))),
    state$.pipe(
      switchMap((state) =>
        match(state)
          .with(State.pending, () => EMPTY)
          .with(State.edit, () => edit.react)
          .with(State.join, () =>
            join.value.props$.pipe(map((props) => h(View, { ...props })))
          )
          .with(State.show, () =>
            show.value.props$.pipe(map((props) => h(View, { ...props })))
          )
          .exhaustive()
      )
    )
  ).pipe(tag("react"))

  const notice = merge(
    ...pluck("notice", [edit, join]),
    errorNotice$,
    noticeAddedNote$,
    liveRecordErrorNotice$
  )

  const router = merge(
    redirectNotFound$,
    ...pluck("router", [edit, join, show])
  )
  const track = merge(...pluck("track", [edit, join]), trackView$)
  const graph = merge(...pluck("graph", [edit]))
  const action = merge(...pluck("action", [edit]))

  return {
    react,
    router,
    notice,
    track,
    graph,
    action,
  }
}
