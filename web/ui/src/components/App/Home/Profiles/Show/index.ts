import { h, ReactSource } from "@cycle/react"
import {
  combineLatest,
  distinctUntilChanged,
  filter,
  map,
  merge,
  share,
  startWith,
} from "rxjs"
import { isNotNullish } from "rxjs-etc"
import { act, Actions, Source as ActionSource } from "~/action"
import { Source as GraphSource } from "~/graph"
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
  } = sources
  const me$ = _me$.pipe(filter(isNotNullish), tag("me$"))
  const profile$ = _profile$.pipe(tag("profile$"))

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

  const props$ = combineLatest({
    state: state$,
    viewer: me$,
    profile: profile$,
  }).pipe(tag("props$"), shareLatest())

  const react = props$.pipe(
    map((props) => h(View, { ...props, onClickEdit, onClickNewConversation }))
  )
  const action = merge(edit$)
  const router = merge(newConversation$)

  return {
    react,
    action,
    router,
  }
}
