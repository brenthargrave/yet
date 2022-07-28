import { ReactSource } from "@cycle/react"
import {
  combineLatest,
  distinctUntilChanged,
  filter,
  map,
  merge,
  Observable,
  of,
  pluck,
  share,
  startWith,
  withLatestFrom,
} from "rxjs"
import { any } from "~/fp"
import { Conversation, isSignableStatus, Source as GraphSource } from "~/graph"
import { makeTagger } from "~/log"
import { push, routes, Source as RouterSource } from "~/router"
import { cb$, shareLatest } from "~/rx"
import { Intent } from "../View"

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

  const tagScope = `${tagPrefix}/Show`
  const tag = makeTagger(tagScope)

  const [onClickBack, onClickBack$] = cb$(tag("onClickBack$"))
  const goToList$ = merge(onClickBack$).pipe(
    map((_) => push(routes.conversations())),
    tag("onClickBack$"),
    share()
  )

  const [onClickShare, onClickShare$] = cb$(tag("onClickShare$"))
  const [onCloseShare, onCloseShare$] = cb$(tag("onCloseShare$"))
  const isOpenShare$ = merge(
    onClickShare$.pipe(map((_) => true)),
    onCloseShare$.pipe(map((_) => false))
  ).pipe(startWith(false), tag("isOpenShare$"), shareLatest())

  const props$ = combineLatest({
    intent: of(Intent.Read),
    conversation: record$,
    isOpenShare: isOpenShare$,
  }).pipe(
    map((props) => {
      return { ...props, onClickShare, onCloseShare, onClickBack }
    }),
    tag("props$")
  )

  const status$ = record$.pipe(
    pluck("status"),
    filter((status) => !!status),
    distinctUntilChanged(),
    tag("status$"),
    share()
  )
  const statusIsSignable$ = status$.pipe(
    map(isSignableStatus),
    startWith(false),
    distinctUntilChanged(),
    tag("statusIsSignable$"),
    share()
  )
  const isReviewer$ = combineLatest({ me: me$, record: record$ }).pipe(
    map(({ record, me }) =>
      any((review) => review.reviewer.id === me?.id, record.reviews)
    ),
    startWith(false),
    distinctUntilChanged(),
    tag("isReviewer$")
  )

  const redirectReviewerToSign$ = combineLatest({
    isSignable: statusIsSignable$,
    isReviewer: isReviewer$,
  }).pipe(
    filter(({ isSignable, isReviewer }) => isSignable && isReviewer),
    distinctUntilChanged(),
    withLatestFrom(record$),
    map(([_, { id }]) => push(routes.signConversation({ id }))),
    tag("redirectReviewerToSign$"),
    share()
  )

  const router = merge(
    //
    redirectReviewerToSign$,
    goToList$
  )
  const value = { props$ }

  return {
    router,
    value,
  }
}
