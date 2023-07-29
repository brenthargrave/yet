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
import { Conversation, isCreatedBy, Source as GraphSource } from "~/graph"
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
  const liveRecord$ = _liveRecord$.pipe(tag("liveRecord$"), shareLatest())

  const id$ = record$.pipe(
    //
    pluck("id"),
    tag("id$"),
    shareLatest()
  )

  const form = Form(
    {
      ...sources,
      props: { id$, record$, liveRecord$ },
    },
    tagScope,
    Mode.edit
  )

  return {
    ...form,
    router: merge(
      //
      form.router
    ),
  }
}
