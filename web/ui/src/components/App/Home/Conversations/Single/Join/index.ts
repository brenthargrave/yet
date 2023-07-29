import { ReactSource } from "@cycle/react"
import { or } from "ramda"
import {
  combineLatest,
  filter,
  map,
  merge,
  mergeMap,
  NEVER,
  Observable,
  of,
  share,
  switchMap,
  withLatestFrom,
} from "rxjs"
import { filterResultErr, filterResultOk } from "ts-results/rxjs-operators"
import {
  Conversation,
  ConversationStatus,
  EventName,
  isCreatedBy,
  isOnboard,
  isParticipant,
  isParticipantIn,
  joinConversation$,
  Source as GraphSource,
  track$,
} from "~/graph"
import { makeTagger } from "~/log"
import { push, routes, routeURL, Source as RouterSource } from "~/router"
import { cb$, noticeFromError$, shareLatest } from "~/rx"
import { Intent } from "../View"

interface Sources {
  react: ReactSource
  router: RouterSource
  graph: GraphSource
  props: {
    record$: Observable<Conversation>
  }
}

export const Join = (sources: Sources, tagPrefix?: string) => {
  const {
    graph: { me$ },
    props: { record$: _record$ },
  } = sources

  const tagScope = `${tagPrefix}/Join`
  const tag = makeTagger(tagScope)

  const record$ = _record$.pipe(tag("record$"), shareLatest())

  // Join / Participate
  const participate$ = combineLatest({
    record: record$,
    me: me$,
  }).pipe(
    filter(
      ({ record, me }) =>
        isOnboard(me) &&
        record.status === ConversationStatus.Proposed &&
        !isCreatedBy(record, me) &&
        !isParticipant(record, me)
    ),
    switchMap(({ record: { id } }) =>
      joinConversation$({
        id,
        conversationUrl: routeURL(routes.conversation({ id })),
      })
    ),
    tag("participate$"),
    share()
  )
  const conversation$ = participate$.pipe(
    filterResultOk(),
    tag("conversation$"),
    share()
  )
  const joinError$ = participate$.pipe(
    filterResultErr(),
    tag("error$"),
    share()
  )
  const joinErrorNotice$ = noticeFromError$(joinError$)

  const trackParticipate$ = conversation$.pipe(
    withLatestFrom(me$),
    mergeMap(([record, me]) =>
      track$({
        customerId: me?.id,
        name: EventName.JoinConversation,
        properties: {
          conversationId: record.id,
        },
      })
    ),
    tag("trackReview$"),
    share()
  )

  // Auth to participate
  const [onClickAuth, onClickAuth$] = cb$(tag("onClickAuth$"))
  const redirectToAuth$ = onClickAuth$.pipe(
    map((_) => push(routes.in())),
    tag("redirectToAuth$"),
    share()
  )

  const joinNotice$ = conversation$.pipe(
    switchMap((_) => NEVER),
    tag("joinNotice$"),
    share()
  )

  const redirectToShow$ = conversation$.pipe(
    map(({ id }) => push(routes.conversation({ id }))),
    tag("redirectToShow$"),
    share()
  )

  const props$ = combineLatest({
    viewer: me$,
    intent: of(Intent.Join),
    conversation: record$,
  }).pipe(
    map((props) => {
      return { ...props, onClickAuth }
    }),
    tag("props$")
  )

  const redirectCreatorOrCosignerToShow$ = combineLatest({
    me: me$,
    record: record$,
  }).pipe(
    filter(({ me, record }) =>
      or(isCreatedBy(record, me), isParticipantIn(record, me))
    ),
    map(({ me, record: { id } }) => push(routes.conversation({ id }))),
    tag("redirectCreatorOrCosignerToShow$"),
    share()
  )

  const notice = merge(joinErrorNotice$, joinNotice$)
  const router = merge(
    redirectToAuth$,
    redirectToShow$,
    redirectCreatorOrCosignerToShow$
  )
  const track = merge(trackParticipate$)
  const value = { props$ }

  return {
    router,
    notice,
    track,
    value,
  }
}
