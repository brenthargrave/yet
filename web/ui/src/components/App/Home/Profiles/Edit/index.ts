import { h, ReactSource } from "@cycle/react"
import { of } from "ramda"
import {
  combineLatest,
  distinctUntilChanged,
  EMPTY,
  filter,
  map,
  merge,
  Observable,
  share,
  startWith,
  switchMap,
  withLatestFrom,
} from "rxjs"
import { isNotNullish } from "rxjs-etc"
import { pluck } from "rxjs-etc/dist/esm/operators"
import { Action } from "rxjs/internal/scheduler/Action"
import { filterResultErr, filterResultOk } from "ts-results/rxjs-operators"
import { error } from "~/notice"
import { act, Actions, Source as ActionSource } from "~/action"
import {
  getProfile$,
  Profile,
  Source as GraphSource,
  updateProfile$,
} from "~/graph"
import { makeTagger } from "~/log"
import { routes, Source as RouterSource } from "~/router"
import { shareLatest, cb$ } from "~/rx"
import { View, Props as ViewProps } from "./View"

export interface Sources {
  react: ReactSource
  router: RouterSource
  graph: GraphSource
  action: ActionSource
}

export const Edit = (sources: Sources, tagPrefix?: string) => {
  const tagScope = `${tagPrefix}/Show`
  const tag = makeTagger(tagScope)

  const {
    router: { history$ },
    graph: { me$: _me$ },
  } = sources
  const me$ = _me$.pipe(filter(isNotNullish), tag("me$"))

  const [onChangeName, onChangeName$] = cb$<string>(tag("onChangeName$"))
  const [onSubmit, onSubmit$] = cb$(tag("onSubmit$"))

  const id$ = me$.pipe(
    map(({ id }) => id),
    tag("id$"),
    shareLatest()
  )

  const result$ = id$.pipe(
    switchMap((id) => getProfile$({ id })),
    tag("result$"),
    shareLatest()
  )

  const priorProfile$: Observable<Profile> = result$.pipe(
    //
    filterResultOk(),
    tag("savedProfile$"),
    share()
  )

  const priorContact$ = priorProfile$.pipe(
    map(({ contact }) => contact),
    tag("contact$"),
    share()
  )

  const priorName$ = priorContact$.pipe(
    map(({ name }) => name),
    tag("savedName$"),
    share()
  )

  const name$ = merge(priorName$, onChangeName$).pipe(tag("name$"))

  const input$ = combineLatest({
    name: name$,
  }).pipe(tag("payload$"), shareLatest())

  const upsert$ = onSubmit$.pipe(
    withLatestFrom(input$),
    switchMap(([_, input]) => updateProfile$(input)),
    tag("upsert$"),
    share()
  )

  const ok$ = upsert$.pipe(filterResultOk(), tag("ok$"))
  const error$ = upsert$.pipe(filterResultErr(), tag("userError$"))
  const userError$ = error$.pipe(
    map((e) => error({ description: e.message })),
    tag("userNotice$"),
    share()
  )

  const props$: Observable<ViewProps> = combineLatest({
    isDisabledSubmit: of(false),
    defaultValueName: priorName$,
  }).pipe(tag("props$"), shareLatest())

  const react = props$.pipe(
    map((props) => h(View, { ...props, onChangeName, onSubmit }))
  )

  // const action = merge(edit$)
  const notice = merge(userError$)

  return {
    react,
    notice,
    // action,
  }
}
