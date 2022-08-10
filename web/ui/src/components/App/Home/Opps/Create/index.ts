import { h, ReactSource } from "@cycle/react"
import {
  mergeWith,
  startWith,
  map,
  of,
  combineLatest,
  share,
  pluck,
  merge,
  Observable,
} from "rxjs"
import { Source as GraphSource } from "~/graph"
import { cb$, mapTo, shareLatest } from "~/rx"
import { makeTagger } from "~/log"
import { routes, Source as RouterSource } from "~/router"
import { View } from "./View"
import { not } from "~/fp"

interface Sources {
  react: ReactSource
  router: RouterSource
  graph: GraphSource
}

export const Main = (sources: Sources, tagPrefix?: string) => {
  const tagScope = `${tagPrefix}/Create`
  const tag = makeTagger(tagScope)

  const {
    graph: { opps$ },
  } = sources

  const record$ = of({
    org: "",
    role: "",
    desc: "",
  })

  // const recordOrg$ = record$.pipe(pluck("org"), tag("recordOrg$"))
  // const recordRole$ = record$.pipe(pluck("role"), tag("recordRole$"))
  // const recordDesc$ = record$.pipe(pluck("desc"), tag("recordDesc$"))

  const [onChangeOrg, onChangeOrg$] = cb$<string>(tag("onChangeOrg$"))
  const [onChangeRole, onChangeRole$] = cb$<string>(tag("onChangeRole$"))
  const [onChangeDesc, onChangeDesc$] = cb$<string>(tag("onChangeDesc$"))

  const org$: Observable<string> = record$.pipe(
    pluck("org"),
    mergeWith(onChangeOrg$)
  )
  const role$: Observable<string> = record$.pipe(
    pluck("role"),
    mergeWith(onChangeRole$)
  )
  const desc$: Observable<string> = record$.pipe(
    pluck("desc"),
    mergeWith(onChangeDesc$)
  )

  const payload$ = combineLatest({
    org: org$,
    role: role$,
    desc: desc$,
  }).pipe(tag("payload$"), share())

  // TODO: validation?
  const isValid$ = payload$.pipe(map(({ org, role, desc }) => false))

  const isDisabledSubmit$ = isValid$.pipe(
    map(not),
    startWith(true),
    tag("isDisabledSubmit$"),
    shareLatest()
  )

  const props$ = combineLatest({
    defaultValueOrg: org$,
    defaultValueRole: role$,
    defaultValueDesc: desc$,
    isDisabledSubmit: isDisabledSubmit$,
  }).pipe(tag("props$"), share())

  const react = props$.pipe(
    map((props) =>
      h(View, {
        ...props,
        onChangeOrg,
        onChangeRole,
        onChangeDesc,
      })
    )
  )

  return {
    react,
  }
}
