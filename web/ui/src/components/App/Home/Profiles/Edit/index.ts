import { h, ReactSource } from "@cycle/react"
import { of } from "ramda"
import {
  combineLatest,
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
import { filterResultErr, filterResultOk } from "ts-results/rxjs-operators"
import { act, Actions, Source as ActionSource } from "~/action"
import { Source as GraphSource, updateProfile$ } from "~/graph"
import { makeTagger } from "~/log"
import { error } from "~/notice"
import { Source as RouterSource } from "~/router"
import { cb$, shareLatest } from "~/rx"
import { Props as ViewProps, View } from "./View"

export interface Sources {
  react: ReactSource
  router: RouterSource
  graph: GraphSource
  action: ActionSource
}

export const Edit = (sources: Sources, tagPrefix?: string) => {
  const tagScope = `${tagPrefix}/Edit`
  const tag = makeTagger(tagScope)

  const {
    router: { history$ },
    graph: { me$: _me$, profile$: _profile$ },
  } = sources
  const me$ = _me$.pipe(filter(isNotNullish), tag("me$"))
  const profile$ = _profile$.pipe(tag("profile$"))

  const [onChangeName, onChangeName$] = cb$<string>(tag("onChangeName$"))
  const [onSubmit, onSubmit$] = cb$(tag("onSubmit$"))
  const [onCancel, onCancel$] = cb$(tag("onCancel$"))

  const priorName$ = profile$.pipe(
    map(({ name }) => name),
    tag("savedName$"),
    shareLatest()
  )

  const name$ = merge(priorName$, onChangeName$).pipe(
    tag("name$"),
    shareLatest()
  )

  const input$ = combineLatest({
    name: name$,
  }).pipe(tag("input$"), shareLatest())

  const upsert$ = onSubmit$.pipe(
    withLatestFrom(input$),
    switchMap(([_, input]) => updateProfile$(input)),
    tag("upsert$"),
    share()
  )

  const isSaving$ = merge(
    onSubmit$.pipe(map(() => true)),
    upsert$.pipe(map(() => false))
  ).pipe(startWith(false), tag("isSaving"), shareLatest())

  const ok$ = upsert$.pipe(filterResultOk(), tag("ok$"))
  const show$ = merge(ok$, onCancel$).pipe(
    map(() => act(Actions.showProfile)),
    tag("show$"),
    share()
  )

  const error$ = upsert$.pipe(filterResultErr(), tag("userError$"))
  const userError$ = error$.pipe(
    map((e) => error({ description: e.message })),
    tag("userNotice$"),
    share()
  )

  const props$: Observable<ViewProps> = combineLatest({
    isSaving: isSaving$,
    isDisabledSubmit: of(false),
    defaultValueName: priorName$,
  }).pipe(tag("props$"), shareLatest())

  const react = props$.pipe(
    map((props) => h(View, { ...props, onChangeName, onSubmit, onCancel }))
  )

  const action = merge(show$)
  const notice = merge(userError$)

  return {
    react,
    notice,
    action,
  }
}
