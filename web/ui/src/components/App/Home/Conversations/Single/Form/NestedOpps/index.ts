import { ReactSource } from "@cycle/react"
import {
  distinctUntilChanged,
  EMPTY,
  map,
  Observable,
  of,
  switchMap,
  withLatestFrom,
} from "rxjs"
import { match } from "ts-pattern"
import { Actions, Source as ActionSource } from "~/action"
import { Location, Opps, State as OppsState } from "~/components/App/Home/Opps"
import { Conversation, DraftConversation, Source as GraphSource } from "~/graph"
import { makeTagger } from "~/log"
import { NEWID, push, routes, Source as RouterSource } from "~/router"
import { shareLatest } from "~/rx"
import { Mode } from ".."

interface Sources {
  react: ReactSource
  router: RouterSource
  graph: GraphSource
  action: ActionSource
  props: {
    record$: Observable<DraftConversation>
  }
}

export const NestedOpps = (
  sources: Sources,
  _tagPrefix: string,
  mode: Mode
) => {
  const tagPrefix = `${_tagPrefix}/NestedOpps`
  const tag = makeTagger(tagPrefix)

  const {
    props: { record$ },
    router: { history$ },
  } = sources

  const oppsState$ = history$.pipe(
    map((route) =>
      match(route)
        .with({ name: routes.conversationOpps.name }, () => OppsState.list)
        .with({ name: routes.conversationOpp.name }, ({ params: { oid } }) =>
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
        .with({ name: routes.conversationOpp.name }, ({ params: { oid } }) =>
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
        location: Location.modal,
        state$: oppsState$,
        id$: oppID$,
      },
    },
    tagPrefix
  )

  const { action, ...nestedOpps } = opps

  const router = opps.action.pipe(
    withLatestFrom(record$),
    switchMap(([action, { id: _id, ...record }]) => {
      const id = mode === Mode.create ? NEWID : _id
      return match(action)
        .with({ type: Actions.listOpps }, () =>
          of(push(routes.conversationOpps({ id })))
        )
        .with({ type: Actions.createOpp }, () =>
          of(push(routes.conversationOpp({ id, oid: NEWID })))
        )
        .with({ type: Actions.showOpp }, ({ opp }) =>
          of(push(routes.conversationOpp({ id, oid: opp.id })))
        )
        .otherwise(() => EMPTY)
    }),
    tag("router")
  )

  return {
    router,
    ...nestedOpps,
    action,
  }
}
