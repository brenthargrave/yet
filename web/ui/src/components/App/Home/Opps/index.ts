import { ReactSource } from "@cycle/react"
import { merge, Observable, share, switchMap } from "rxjs"
import { match } from "ts-pattern"
import { Source as ActionSource } from "~/action"
import { ID, Source as GraphSource } from "~/graph"
import { makeTagger } from "~/log"
import { Main as List } from "./List"
import { Single } from "./Single"
import { Create } from "./Single/Create"

export enum Location {
  home = "home",
  modal = "modal",
}

export enum State {
  list = "list",
  create = "create",
  single = "single",
}

export interface Props {
  location: Location
  state$: Observable<State>
  id$: Observable<ID>
}

export interface Sources {
  react: ReactSource
  graph: GraphSource
  action: ActionSource
  props: Props
}

export const Opps = (sources: Sources, tagPrefix?: string) => {
  const tagScope = `${tagPrefix}/Opps`
  const tag = makeTagger(tagScope)

  const {
    props: { state$, id$, location },
  } = sources

  const list = List({ ...sources, props: { location } }, tagScope)
  const create = Create({ ...sources, props: { state$ } }, tagScope)
  const single = Single({ ...sources, props: { state$, id$ } }, tagScope)

  const react = state$.pipe(
    switchMap((state) =>
      match(state)
        .with(State.list, () => list.react)
        .with(State.create, () => create.react)
        .with(State.single, () => single.react)
        .exhaustive()
    ),
    tag("react"),
    share()
  )

  const action = merge(list.action, single.action)
  const notice = merge(create.notice, single.notice)
  const value = { ...list.value }

  return {
    action,
    react,
    notice,
    value,
  }
}
