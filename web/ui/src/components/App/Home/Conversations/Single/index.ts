import { h, ReactSource } from "@cycle/react"
import { and } from "ramda"
import {
  combineLatest,
  distinctUntilChanged,
  EMPTY,
  filter,
  map,
  merge,
  Observable,
  of,
  share,
  switchMap,
  withLatestFrom,
} from "rxjs"
import { isNotNullish } from "rxjs-etc"
import { match } from "ts-pattern"
import { filterResultErr, filterResultOk } from "ts-results/rxjs-operators"
import { Source as ActionSource } from "~/action"
import { ErrorView } from "~/components/App/ErrorView"
import { pluck } from "~/fp"
import {
  Conversation,
  ErrorCode,
  getConversation$,
  isCreatedBy,
  isStatusEditable,
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
    share()
  )

  const result$ = id$.pipe(
    switchMap((id) => getConversation$(id)),
    tag("result$"),
    share()
  )

  const record$ = result$.pipe(filterResultOk(), tag("record$"), share())

  const liveRecord$ = id$.pipe(
    switchMap((id) => subscribeConversation$({ id })),
    tag("liveRecord$"),
    share()
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

  const state$ = record$.pipe(
    withLatestFrom(history$, me$),
    map(([record, route, me]) =>
      match(route)
        .with({ name: routes.signConversation.name }, () => State.sign)
        .when(singleConversationRoutesGroup.has, ({ params: { id } }) => {
          const created = isCreatedBy(record, me)
          const editable = isStatusEditable(record.status)
          const result = and(created, editable)
          return result ? State.edit : State.show
        })
        .otherwise(() => State.pending)
    ),
    distinctUntilChanged(),
    tag("state$")
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
      share()
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
          // .run()
          .exhaustive()
      )
    )
  ).pipe(tag("react"))

  const notice = merge(...pluck("notice", [edit, sign]), userErrorNotice$)

  const router = merge(
    ...pluck("router", [edit, sign, show]),
    redirectNotFound$
  )
  const track = merge(...pluck("track", [edit, sign]))
  const graph = merge(...pluck("graph", [edit]))

  return {
    react,
    router,
    notice,
    track,
    graph,
  }
}
