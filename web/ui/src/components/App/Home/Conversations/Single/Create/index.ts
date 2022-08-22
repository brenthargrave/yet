import { ReactSource } from "@cycle/react"
import { distinctUntilChanged, map, Observable, of, switchMap } from "rxjs"
import { Source as ActionSource } from "~/action"
import {
  newConversation,
  Source as GraphSource,
  subscribeConversation$,
} from "~/graph"
import { makeTagger } from "~/log"
import { Source as RouterSource } from "~/router"
import { shareLatest } from "~/rx"
import { Form, Mode } from "../Form"

interface Sources {
  react: ReactSource
  router: RouterSource
  graph: GraphSource
  action: ActionSource
  props: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    reset$: Observable<any>
  }
}

export const Create = (sources: Sources, tagPrefix?: string) => {
  const {
    props: { reset$ },
  } = sources

  const tagScope = `${tagPrefix}/Create`
  const tag = makeTagger(tagScope)

  const record$ = reset$.pipe(
    switchMap((_) => of(newConversation())),
    tag("record$"),
    shareLatest()
  )

  const id$ = record$.pipe(
    map((record) => record.id),
    tag("id$"),
    shareLatest()
  )

  const liveRecord$ = id$.pipe(
    distinctUntilChanged(),
    switchMap((id) => subscribeConversation$({ id })),
    tag("liveRecord$"),
    shareLatest()
  )

  const form = Form(
    {
      ...sources,
      props: { id$, record$, liveRecord$ },
    },
    tagScope,
    Mode.create
  )

  return {
    ...form,
  }
}
