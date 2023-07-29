import { h } from "@cycle/react"
import { distinctUntilKeyChanged, map, Observable, share } from "rxjs"
import { DraftNote } from "~/graph"
import { makeTagger } from "~/log"
import { shareLatest } from "~/rx"
import { Props as ViewProps, View } from "./View"

export { View as NoteView }
export type { ViewProps as NoteViewProps }

interface Props {
  note$: Observable<DraftNote>
}

interface Sources {
  props: Props
}

export const Show = (sources: Sources, _tagPrefix: string) => {
  const {
    props: { note$: _note$ },
  } = sources
  const tagPrefix = `${_tagPrefix}/Show`
  const tag = makeTagger(tagPrefix)

  const note$ = _note$.pipe(
    distinctUntilKeyChanged("id"),
    tag("note$"),
    shareLatest()
  )

  const react = note$.pipe(
    map((note) => {
      return h(View, { note })
    }),
    tag("react"),
    share()
  )

  return {
    react,
  }
}
