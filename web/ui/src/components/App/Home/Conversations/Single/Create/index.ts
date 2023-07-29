import { ReactSource } from "@cycle/react"
import {
  distinctUntilChanged,
  map,
  merge,
  Observable,
  of,
  share,
  switchMap,
} from "rxjs"
import { filterResultErr, filterResultOk } from "ts-results/rxjs-operators"
import { Source as ActionSource } from "~/action"
import {
  newConversation,
  Source as GraphSource,
  subscribeConversation$,
} from "~/graph"
import { makeTagger } from "~/log"
import { Source as RouterSource } from "~/router"
import { noticeFromError$, shareLatest } from "~/rx"
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
    notice: merge(form.notice, liveRecordErrorNotice$),
  }
}
