import { h, ReactSource } from "@cycle/react"
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
import { and, pluck } from "~/fp"
import {
  Conversation,
  ErrorCode,
  EventName,
  getConversation$,
  Intent,
  isCreatedBy,
  isStatusEditable,
  Source as GraphSource,
  subscribeConversation$,
  track$,
} from "~/graph"
import { makeTagger } from "~/log"
import { error } from "~/notice"
import {
  NEWID,
  push,
  routes,
  singleConversationRoutesGroup,
  Source as RouterSource,
} from "~/router"
import { shareLatest } from "~/rx"
import { Main as Edit } from "./Edit"
import { Show } from "./Show"
import { Sign } from "./Sign"
import { View } from "./View"

export enum State {
  pending = "pending",
  edit = "edit",
  sign = "sign",
  show = "show",
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
    tag("id$"),
    shareLatest()
  )

  const result$ = id$.pipe(
    switchMap((id) => getConversation$(id)),
    tag("result$"),
    share()
  )

  const record$ = result$.pipe(filterResultOk(), tag("record$"), shareLatest())

  const liveRecord$ = id$.pipe(
    switchMap((id) => subscribeConversation$({ id })),
    tag("liveRecord$"),
    shareLatest()
  )

  const userError$ = result$.pipe(filterResultErr(), tag("userError$"), share())

  const userErrorNotice$ = userError$.pipe(
    map(({ message }) => error({ description: message })),
    tag("userErrorNotice$"),
    share()
  )

  const redirectNotFound$ = userError$.pipe(
    filter(({ code }) => code === ErrorCode.NotFound),
    map((_) => push(routes.conversations())),
    tag("redirectNotFound$"),
    share()
  )

  const isLoading$ = combineLatest({ id: id$, opp: record$ }).pipe(
    map(({ id, opp }) => opp.id !== id),
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
            .with({ name: routes.signConversation.name }, () => State.sign)
            .when(singleConversationRoutesGroup.has, ({ params: { id } }) => {
              const created = isCreatedBy(record, me)
              const editable = isStatusEditable(record.status)
              return and(created, editable) ? State.edit : State.show
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

  const sign = Sign(
    {
      ...sources,
      props: { record$: stateRecord$(State.sign, merge(record$, liveRecord$)) },
    },
    tagScope
  )
  const show = Show(
    {
      ...sources,
      props: { record$: stateRecord$(State.show, merge(record$, liveRecord$)) },
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
      .with(State.sign, () => Intent.Sign)
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
          conversationId: record.id,
          intent: mapStateToIntent(state),
          signatureCount: me?.stats?.signatureCount,
        },
      })
    ),
    tag("trackView$"),
    share()
  )

  const react = merge(
    userError$.pipe(map((error) => h(ErrorView, { error }))),
    state$.pipe(
      switchMap((state) =>
        match(state)
          .with(State.pending, () => EMPTY)
          .with(State.edit, () => edit.react)
          .with(State.sign, () =>
            sign.value.props$.pipe(map((props) => h(View, { ...props })))
          )
          .with(State.show, () =>
            show.value.props$.pipe(map((props) => h(View, { ...props })))
          )
          .exhaustive()
      )
    )
  ).pipe(tag("react"))

  const notice = merge(...pluck("notice", [edit, sign]), userErrorNotice$)

  const router = merge(
    ...pluck("router", [edit, sign, show]),
    redirectNotFound$
  )
  const track = merge(...pluck("track", [edit, sign]), trackView$)
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
