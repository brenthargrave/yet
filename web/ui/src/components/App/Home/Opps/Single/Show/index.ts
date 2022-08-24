import { h, ReactSource } from "@cycle/react"
import { combineLatest, map, merge, Observable, of, share } from "rxjs"
import { act, Actions } from "~/action"
import { Opp, Source as GraphSource } from "~/graph"
import { makeTagger } from "~/log"
import { cb$, mapTo } from "~/rx"
import { Location } from ".."
import { Props as ViewProps, View } from "./View"

type Record = Opp

interface Props {
  record$: Observable<Record>
  location: Location
}

interface Sources {
  react: ReactSource
  graph: GraphSource
  props: Props
}

export const Show = (sources: Sources, tagPrefix?: string) => {
  const {
    graph: { me$ },
    props: { record$, location },
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
    viewer: me$,
    location: of(location),
    opp: record$,
    // viewer: me$,
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
