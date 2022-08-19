import { h, ReactSource } from "@cycle/react"
import { and } from "ramda"
import {
  distinctUntilChanged,
  EMPTY,
  filter,
  map,
  merge,
  of,
  share,
  startWith,
  switchMap,
  withLatestFrom,
} from "rxjs"
import { delayUntil } from "rxjs-etc/dist/esm/operators"
import { match, P } from "ts-pattern"
import { filterResultErr, filterResultOk } from "ts-results/rxjs-operators"
import { Source as ActionSource } from "~/action"
import { ErrorView } from "~/components/App/ErrorView"
import {
  Conversation,
  Customer,
  ErrorCode,
  getConversation$,
  ID,
  isCreatedBy,
  isStatusEditable,
  Maybe,
  Source as GraphSource,
  subscribeConversation$,
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
import { Main as Show } from "./Show"
import { Main as Sign } from "./Sign"
import { View } from "./View"

export enum State {
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

export const Main = (sources: Sources, tagPrefix?: string) => {
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
    shareLatest()
  )

  const record$ = result$.pipe(filterResultOk(), tag("record$"), shareLatest())

  const liveRecord$ = id$.pipe(
    distinctUntilChanged(),
    switchMap((id) => subscribeConversation$({ id })),
    tag("liveRecord$"),
    shareLatest()
  )

  const userError$ = result$.pipe(
    filterResultErr(),
    tag("userError$"),
    shareLatest()
  )

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

  const resolveState = (
    id: ID,
    me: Maybe<Customer>,
    record: Conversation
  ): State => {
    return and(isCreatedBy(record, me), isStatusEditable(record.status))
      ? State.edit
      : State.show
  }

  const state$ = history$.pipe(
    delayUntil(record$),
    withLatestFrom(me$, record$),
    map(([route, me, record]) =>
      match(route)
        .with({ name: routes.signConversation.name }, () => State.sign)
        .when(singleConversationRoutesGroup.has, ({ params: { id } }) =>
          resolveState(id, me, record)
        )
        .otherwise(() => State.show)
    ),
    distinctUntilChanged(),
    tag("state$"),
    shareLatest()
  )

  const existingRecordSources = {
    ...sources,
    props: { state$, record$, liveRecord$ },
  }
  const show = Show(existingRecordSources, tagScope)
  const sign = Sign(existingRecordSources, tagScope)
  const edit = Edit(existingRecordSources, tagScope)

  const react = merge(
    userError$.pipe(map((error) => h(ErrorView, { error }))),
    state$.pipe(
      switchMap((state) =>
        match(state)
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
  ).pipe(startWith(null), tag("react"))

  const router = merge(
    //
    edit.router,
    sign.router,
    show.router,
    redirectNotFound$
  )
  const notice = merge(
    //
    edit.notice,
    sign.notice,
    userErrorNotice$
  )
  const track = merge(
    //
    edit.track,
    sign.track
  )
  const graph = merge(
    //
    edit.graph
  )

  return {
    react,
    router,
    notice,
    track,
    graph,
  }
}
