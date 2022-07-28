import { ReactSource } from "@cycle/react"
import {
  filter,
  combineLatest,
  map,
  merge,
  Observable,
  of,
  share,
  startWith,
} from "rxjs"
import {
  Conversation,
  ConversationPayloadPropsFragmentDoc,
  ConversationStatus,
  isReviewedBy,
  Source as GraphSource,
} from "~/graph"
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

  const redirectReviewerToSign$ = combineLatest({
    me: me$,
    record: record$,
  }).pipe(
    filter(
      ({ me, record }) =>
        record.status === ConversationStatus.Proposed &&
        isReviewedBy(record, me)
    ),
    map(({ me, record: { id } }) => push(routes.signConversation({ id }))),
    tag("redirectReviewerToSign$"),
    share()
  )

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

  const router = merge(redirectReviewerToSign$, goToList$)
  const value = { props$ }

  return {
    router,
    value,
  }
}
