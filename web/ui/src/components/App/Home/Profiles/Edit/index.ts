import { h, ReactSource } from "@cycle/react"
import { of } from "ramda"
import {
  combineLatest,
  map,
  merge,
  Observable,
  share,
  startWith,
  switchMap,
  withLatestFrom,
} from "rxjs"
import { filterResultErr, filterResultOk } from "ts-results/rxjs-operators"
import { act, Actions, Source as ActionSource } from "~/action"
import { Source as GraphSource, updateProfile$ } from "~/graph"
import { makeTagger } from "~/log"
import { error } from "~/notice"
import { Source as RouterSource } from "~/router"
import { cb$, shareLatest } from "~/rx"
import { TextInput } from "./TextInput"
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
    graph: { me$: _me$, profile$: _profile$ },
  } = sources
  const profile$ = _profile$.pipe(tag("profile$"))

  const firstName = TextInput(
    {
      props: {
        placeholder: "First Name",
        autoFocus: false,
        prior$: profile$.pipe(
          map(({ firstName }) => firstName),
          tag("firstName$"),
          shareLatest()
        ),
      },
    },
    `${tagScope}/FirstName`
  )

  const lastName = TextInput(
    {
      props: {
        placeholder: "Last Name",
        autoFocus: false,
        prior$: profile$.pipe(
          map((profile) => profile.lastName),
          tag("lastName$"),
          shareLatest()
        ),
      },
    },
    `${tagScope}/LastName`
  )

  const [onSubmit, onSubmit$] = cb$(tag("onSubmit$"))
  const [onCancel, onCancel$] = cb$(tag("onCancel$"))

  const input$ = combineLatest({
    firstName: firstName.value,
    lastName: lastName.value,
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
    firstNameInput: firstName.react,
    lastNameInput: lastName.react,
  }).pipe(tag("props$"), shareLatest())

  const react = props$.pipe(
    map((props) => h(View, { ...props, onSubmit, onCancel }))
  )

  const action = merge(show$)
  const notice = merge(userError$)

  return {
    react,
    notice,
    action,
  }
}
