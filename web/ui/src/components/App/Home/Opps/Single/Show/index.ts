import { h, ReactSource } from "@cycle/react"
import { combineLatest, map, merge, Observable, share, switchMap } from "rxjs"
import { Opp, Source as GraphSource } from "~/graph"
import { makeTagger } from "~/log"
import { push, routes, Source as RouterSource } from "~/router"
import { cb$ } from "~/rx"
import { View, Props as ViewProps } from "./View"

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
    map((_) => push(routes.opps())),
    tag("onClickBack$"),
    share()
  )

  const props$: Observable<ViewProps> = combineLatest({
    // viewer: me$,
    opp: record$,
  }).pipe(tag("props$"))

  const react = props$.pipe(
    map((props) => h(View, { ...props })),
    tag("react")
  )

  const router = merge(
    //
    goToList$
  )

  return {
    react,
    router,
  }
}
