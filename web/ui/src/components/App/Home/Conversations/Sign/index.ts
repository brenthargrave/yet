import { h, ReactSource } from "@cycle/react"
import {
  combineLatest,
  debounceTime,
  EMPTY,
  filter,
  map,
  merge,
  Observable,
  of,
  share,
  startWith,
  switchMap,
  withLatestFrom,
} from "rxjs"
import { match } from "ts-pattern"
import { filterResultErr, filterResultOk } from "ts-results/rxjs-operators"
import { ErrorView } from "~/components/App/ErrorView"
import {
  getConversation$,
  isLurking,
  isSignedBy,
  signConversation$,
  Source as GraphSource,
} from "~/graph"
import { makeTagger } from "~/log"
import { error, info } from "~/notice"
import { push, routes, Source as RouterSource } from "~/router"
import { cb$, shareLatest } from "~/rx"
import { Step, View } from "./View"

interface Sources {
  react: ReactSource
  router: RouterSource
  graph: GraphSource
}

export const Sign = (sources: Sources, tagPrefix?: string) => {
  const {
    router: { history$ },
    graph: { me$ },
  } = sources

  const tagScope = `${tagPrefix}/Sign`
  const tag = makeTagger(tagScope)

  const id$ = history$.pipe(
    switchMap((route) =>
      match(route)
        .with({ name: routes.signConversation.name }, ({ params }) =>
          of(params.id)
        )
        .otherwise(() => EMPTY)
    ),
    tag("id$"),
    shareLatest()
  )
  const result$ = id$.pipe(
    switchMap((id) => getConversation$(id)),
    tag("result$"),
    shareLatest()
  )
  const record$ = result$.pipe(filterResultOk(), tag("record$"), shareLatest())
  const userError$ = result$.pipe(
    filterResultErr(),
    tag("userError$"),
    shareLatest()
  )
  const userErrorNotice$ = userError$.pipe(
    map(({ message }) => error({ description: message })),
    tag("userErrorNotice$"),
    share()
  )

  const redirectCreatorToShow$ = combineLatest({
    me: me$,
    record: record$,
  }).pipe(
    filter(({ me, record }) => me?.id === record.creator.id),
    map(({ me, record: { id } }) => push(routes.conversation({ id }))),
    tag("redirectCreatorToShow$"),
    share()
  )

  const [onClickAuth, onClickAuth$] = cb$(tag("onClickAuth$"))
  const redirectToAuth$ = onClickAuth$.pipe(
    map((_) => push(routes.in())),
    tag("redirectToAuth$"),
    share()
  )

  const step$: Observable<Step> = combineLatest({
    me: me$,
    conversation: record$,
  }).pipe(
    map(({ me, conversation }) => {
      if (isLurking(me)) return Step.Auth
      if (isSignedBy(conversation, me)) return Step.Share
      return Step.Sign
    }),
    startWith(Step.Sign),
    debounceTime(100),
    tag("step$"),
    shareLatest()
  )

  const [onClickSign, onClickSign$] = cb$(tag("onClickSign$"))
  const signResult$ = onClickSign$.pipe(
    withLatestFrom(id$),
    switchMap(([_, id]) => signConversation$({ id })),
    tag("signResult$"),
    share()
  )

  const signError$ = signResult$.pipe(
    filterResultErr(),
    tag("userError$"),
    share()
  )
  const signUserError$ = signError$.pipe(
    map(({ message }) => error({ description: message })),
    tag("signUserError$"),
    share()
  )
  const signRecord$ = signResult$.pipe(
    filterResultOk(),
    tag("record$"),
    share()
  )
  const alertSigned$ = signRecord$.pipe(
    map((_) => info({ description: "Cosigned!" })),
    tag("alertSigned$"),
    share()
  )
  const redirectSignedToShow$ = signRecord$.pipe(
    map(({ id }) => push(routes.conversation({ id }))),
    tag("redirectSignedToShow$"),
    share()
  )

  const isSigningLoading$ = merge(
    onClickSign$.pipe(map((_) => true)),
    signResult$.pipe(map((_) => false))
  ).pipe(startWith(false), tag("isSigningLoading$"), shareLatest())

  const props$ = combineLatest({
    step: step$,
    conversation: record$,
    isSignLoading: isSigningLoading$,
  }).pipe(tag("props$"))

  const react = merge(
    props$.pipe(
      map((props) => h(View, { ...props, onClickAuth, onClickSign }))
    ),
    userError$.pipe(map((error) => h(ErrorView, { error })))
  ).pipe(startWith(null), tag("react"))

  const notice = merge(userErrorNotice$, signUserError$, alertSigned$)
  const router = merge(
    redirectCreatorToShow$,
    redirectToAuth$,
    redirectSignedToShow$
  )

  return {
    react,
    router,
    notice,
  }
}
