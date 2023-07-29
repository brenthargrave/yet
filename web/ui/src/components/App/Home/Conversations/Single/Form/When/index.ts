import { h } from "@cycle/react"
import {
  combineLatest,
  distinctUntilChanged,
  map,
  merge,
  mergeMap,
  Observable,
  pluck,
  startWith,
  withLatestFrom,
} from "rxjs"
import {
  ConversationProp,
  DraftConversation,
  EventName,
  Source as GraphSource,
  track$,
} from "~/graph"
import { makeTagger } from "~/log"
import { cb$, shareLatest } from "~/rx"
import { View } from "./View"

interface Sources {
  graph: GraphSource
  props: {
    record$: Observable<DraftConversation>
    isDisabled$: Observable<boolean>
  }
}

export const When = (sources: Sources, _tagPrefix: string) => {
  const tagPrefix = `${_tagPrefix}/When`
  const tag = makeTagger(tagPrefix)

  const {
    graph: { me$ },
    props: { record$: _record$, isDisabled$ },
  } = sources

  const record$ = _record$.pipe(tag("record$"), shareLatest())

  const [onChangeOccurredAt, onChangeOccurredAt$] = cb$<Date>(
    tag("onChangeOccurredAt$")
  )

  const recordOccurredAt$: Observable<Date> = record$.pipe(
    pluck("occurredAt"),
    distinctUntilChanged(),
    tag("recordOccurredAt$"),
    shareLatest()
  )

  const occurredAt$ = merge(recordOccurredAt$, onChangeOccurredAt$).pipe(
    distinctUntilChanged(),
    startWith(new Date()),
    tag("occurredAt$"),
    shareLatest()
  )

  const props$ = combineLatest({
    occurredAt: occurredAt$,
    isDisabled: isDisabled$,
  }).pipe(tag("props$"))

  const react = props$.pipe(
    map((props) =>
      h(View, {
        ...props,
        onChangeOccurredAt,
      })
    ),
    tag("react")
  )

  const track = onChangeOccurredAt$.pipe(
    withLatestFrom(record$, me$),
    mergeMap(([_date, record, me]) =>
      track$({
        customerId: me?.id,
        name: EventName.UpdateConversation,
        properties: {
          conversationProp: ConversationProp.OccurredAt,
          conversationId: record.id,
        },
      })
    ),
    tag("track$")
  )

  const value = {
    onChangeOccurredAt$,
    occurredAt$,
  }

  return {
    react,
    track,
    value,
  }
}
