import { h, ReactSource } from "@cycle/react"
import { combineLatest, map, merge, Observable, of, share } from "rxjs"
import { act, Actions } from "~/action"
import { OppProfile, Source as GraphSource } from "~/graph"
import { makeTagger } from "~/log"
import { cb$, mapTo } from "~/rx"
import { Location } from ".."
import { Props as ViewProps, View } from "./View"

interface Sources {
  react: ReactSource
  graph: GraphSource
  props: {
    oppProfile$: Observable<OppProfile>
    location: Location
  }
}

export const Show = (sources: Sources, tagPrefix?: string) => {
  const {
    graph: { me$ },
    props: { oppProfile$, location },
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

  const props$: Observable<ViewProps> = combineLatest({
    location: of(location),
    viewer: me$,
    oppProfile: oppProfile$,
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
