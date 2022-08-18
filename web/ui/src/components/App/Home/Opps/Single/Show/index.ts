import { h, ReactSource } from "@cycle/react"
import { combineLatest, map, merge, Observable, share } from "rxjs"
import { act, Actions } from "~/action"
import { Opp, Source as GraphSource } from "~/graph"
import { makeTagger } from "~/log"
import { cb$, mapTo } from "~/rx"
import { Props as ViewProps, View } from "./View"

type Record = Opp

interface Props {
  record$: Observable<Record>
}

interface Sources {
  react: ReactSource
  graph: GraphSource
  props: Props
}

export const Show = (sources: Sources, tagPrefix?: string) => {
  const {
    graph: { me$ },
    props: { record$ },
  } = sources

  const tagScope = `${tagPrefix}/Show`
  const tag = makeTagger(tagScope)

  const [onClickBack, onClickBack$] = cb$(tag("onClickBack$"))
  const goToList$ = merge(onClickBack$).pipe(
    mapTo(act(Actions.listOpps)),
    tag("onClickBack$"),
    share()
  )

  const props$: Observable<ViewProps> = combineLatest({
    // viewer: me$,
    opp: record$,
  }).pipe(tag("props$"))

  const react = props$.pipe(
    map((props) => h(View, { ...props, onClickBack })),
    tag("react")
  )

  const action = merge(
    //
    goToList$
  )

  return {
    react,
    action,
  }
}
