import { ReactSource } from "@cycle/react"
import {
  catchError,
  combineLatest,
  debounceTime,
  EMPTY,
  filter,
  map,
  merge,
  mergeMap,
  Observable,
  of,
  share,
  startWith,
  switchMap,
  withLatestFrom,
} from "rxjs"
import { filterResultErr, filterResultOk } from "ts-results/rxjs-operators"
import {
  Conversation,
  ConversationStatus,
  EventName,
  isCreatedBy,
  isLurking,
  isOnboard,
  isReviewedBy,
  isSignedBy,
  reviewConversation$,
  signConversation$,
  Source as GraphSource,
  track$,
} from "~/graph"
import { makeTagger } from "~/log"
import { error, info } from "~/notice"
import { push, routes, Source as RouterSource } from "~/router"
import { cb$, shareLatest } from "~/rx"
import { Intent, Step } from "../View"

interface Sources {
  react: ReactSource
  router: RouterSource
  graph: GraphSource
  props: { record$: Observable<Conversation> }
}

export const Main = (sources: Sources, tagPrefix?: string) => {
  const {
    router: { history$ },
    graph: { me$ },
    props: { record$ },
  } = sources

  const tagScope = `${tagPrefix}/Sign`
  const tag = makeTagger(tagScope)

  const review$ = combineLatest({
    route: history$,
    record: record$,
    me: me$,
  }).pipe(
    filter(
      ({ route, record, me }) =>
        isOnboard(me) &&
        route.name === routes.signConversation.name &&
        record.status === ConversationStatus.Proposed &&
        !isCreatedBy(record, me) &&
        !isReviewedBy(record, me)
    ),
    switchMap(({ route, record }) =>
      reviewConversation$({ id: record.id }).pipe(
        catchError((error, caugh$) => EMPTY)
      )
    ),
    tag("review$"),
    share()
  )
  const trackReview$ = review$.pipe(
    filterResultOk(),
    mergeMap((record) =>
      track$({
        name: EventName.ReviewedConversation,
        properties: {
          conversation: record.id,
        },
      })
    ),
    tag("trackReview$"),
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
    map(({ me, conversation }) => (isLurking(me) ? Step.Auth : Step.Sign)),
    startWith(Step.Sign),
    debounceTime(100),
    tag("step$"),
    shareLatest()
  )

  const [onClickSign, onClickSign$] = cb$(tag("onClickSign$"))
  const signResult$ = onClickSign$.pipe(
    withLatestFrom(record$),
    switchMap(([_, record]) => signConversation$({ id: record.id })),
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
    viewer: me$,
    intent: of(Intent.Sign),
    step: step$,
    conversation: record$,
    isSignLoading: isSigningLoading$,
  }).pipe(
    map((props) => {
      return { ...props, onClickAuth, onClickSign }
    }),
    tag("props$")
  )

  const redirectCreatorOrCosignerToShow$ = combineLatest({
    route: history$,
    me: me$,
    record: record$,
  }).pipe(
    filter(
      ({ route, me, record }) =>
        (route.name === routes.signConversation.name &&
          me?.id === record.creator.id) ||
        isSignedBy(record, me)
    ),
    map(({ me, record: { id } }) => push(routes.conversation({ id }))),
    tag("redirectCreatorOrCosignerToShow$"),
    share()
  )

  const notice = merge(signUserError$, alertSigned$)
  const router = merge(
    redirectCreatorOrCosignerToShow$,
    redirectToAuth$,
    redirectSignedToShow$
  )
  const track = merge(trackReview$)
  const value = { props$ }

  return {
    router,
    notice,
    value,
    track,
  }
}
