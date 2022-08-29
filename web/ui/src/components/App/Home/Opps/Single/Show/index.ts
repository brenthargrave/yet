import { h, ReactSource } from "@cycle/react"
import {
  combineLatest,
  map,
  merge,
  Observable,
  of,
  share,
  startWith,
  switchMap,
} from "rxjs"
import { filterResultOk } from "ts-results/rxjs-operators"
import { act, Actions } from "~/action"
import { getTimeline$, Opp, Source as GraphSource } from "~/graph"
import { makeTagger } from "~/log"
import { cb$, mapTo, shareLatest } from "~/rx"
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

  const [onClickEdit, onClickEdit$] = cb$(tag("onClickEdit$"))
  const clickEdit$ = onClickEdit$.pipe(
    map(() => act(Actions.editOpp)),
    tag("clickEdit$"),
    share()
  )

  const events$ = record$.pipe(
    switchMap((opp) => getTimeline$({ filters: { opps: [opp.id] } })),
    filterResultOk(),
    startWith([]),
    tag("events$"),
    shareLatest()
  )

  const props$: Observable<ViewProps> = combineLatest({
    location: of(location),
    viewer: me$,
    opp: record$,
    events: events$,
  }).pipe(tag("props$"))

  const react = props$.pipe(
    map((props) => h(View, { ...props, onClickBack, onClickEdit })),
    tag("react")
  )

  const action = merge(
    //
    goToList$,
    clickEdit$
  )

  return {
    react,
    action,
  }
}
