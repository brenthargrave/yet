import { ReactSource } from "@cycle/react"
import {
  combineLatest,
  filter,
  map,
  merge,
  Observable,
  pluck,
  share,
} from "rxjs"
import { Source as ActionSource } from "~/action"
import { Conversation, Source as GraphSource } from "~/graph"
import { makeTagger } from "~/log"
import { push, routes, Source as RouterSource } from "~/router"
import { shareLatest } from "~/rx"
import { Form, Mode } from "../Form"

interface Sources {
  react: ReactSource
  router: RouterSource
  graph: GraphSource
  action: ActionSource
  props: {
    record$: Observable<Conversation>
    liveRecord$: Observable<Conversation>
  }
}

export const Main = (sources: Sources, tagPrefix?: string) => {
  const {
    graph: { me$ },
    props: { record$: _record$, liveRecord$: _liveRecord$ },
  } = sources

  const tagScope = `${tagPrefix}/Edit`
  const tag = makeTagger(tagScope)

  const record$ = _record$.pipe(tag("record$"), shareLatest())
  const liveRecord$ = _liveRecord$.pipe(tag("record$"), shareLatest())

  const id$ = record$.pipe(
    //
    pluck("id"),
    tag("id$"),
    shareLatest()
  )

  const redirectNonCreatorsToShow$ = combineLatest({
    me: me$,
    record: record$,
  }).pipe(
    filter(({ me, record }) => record.creator.id !== me?.id),
    map(({ record }) => push(routes.conversation({ id: record.id }))),
    tag("redirectNonCreatorToShow$"),
    share()
  )

  const {
    react,
    router: formRouter$,
    notice: formNotice$,
    track,
    graph,
  } = Form(
    {
      ...sources,
      props: { id$, record$, liveRecord$ },
    },
    tagScope,
    Mode.edit
  )

  const router = merge(formRouter$, redirectNonCreatorsToShow$)
  const notice = merge(formNotice$)

  return {
    react,
    notice,
    router,
    track,
    graph,
  }
}
