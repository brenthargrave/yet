import { h } from "@cycle/react"
import {
  combineLatest,
  map,
  merge,
  mergeMap,
  Observable,
  pluck,
  share,
  startWith,
  switchMap,
  withLatestFrom,
} from "rxjs"
import { filterResultErr, filterResultOk } from "ts-results/rxjs-operators"
import { Customer, mute$, ProfileExtended, track$ } from "~/graph"
import { makeTagger } from "~/log"
import { cb$, mapTo, noticeFromError$, shareLatest } from "~/rx"
import { View } from "./View"

interface Props {
  me$: Observable<Customer>
  profile$: Observable<ProfileExtended>
}

export interface Sources {
  props: Props
  //   react: ReactSource
  //   router: RouterSource
  //   graph: GraphSource
  //   action: ActionSource
}

export const MuteButton = (sources: Sources, tagPrefix?: string) => {
  const tagScope = `${tagPrefix}/MuteButton`
  const tag = makeTagger(tagScope)

  const {
    props: { me$, profile$ },
  } = sources

  // const me$ = _me$.pipe(filter(isNotNullish), tag("me$"))

  const recordMuted = profile$.pipe(
    pluck("isMuted"),
    startWith(false),
    tag("isMuted"),
    shareLatest()
  )

  const [onClickMute, onClickMute$] = cb$<boolean>(tag("onClick$"))
  const muteResult$ = onClickMute$.pipe(
    withLatestFrom(profile$),
    switchMap(([active, { id }]) => mute$({ profileId: id, active })),
    tag("mute$"),
    share()
  )

  const muteError$ = muteResult$.pipe(
    filterResultErr(),
    tag("muteError$"),
    share()
  )
  const errorNotice = noticeFromError$(muteError$)

  const mutedProfile$ = muteResult$.pipe(
    filterResultOk(),
    tag("mutedProfile$"),
    share()
  )
  const resultMuted$ = mutedProfile$.pipe(
    map((p) => p.isMuted),
    tag("resultMuted$"),
    share()
  )

  const isMuted = merge(recordMuted, resultMuted$).pipe(
    startWith(false),
    tag("isMuted"),
    shareLatest()
  )

  const isLoading = merge(
    onClickMute$.pipe(mapTo(true)),
    resultMuted$.pipe(mapTo(false))
  ).pipe(startWith(false), tag("isLoading"), shareLatest())

  const props$ = combineLatest({
    isMuted,
    isLoading,
  }).pipe(tag("props$"), shareLatest())

  const react = props$.pipe(
    map((props) =>
      h(View, {
        ...props,
        onClickMute,
      })
    )
  )
  const notice = merge(errorNotice)

  return {
    react,
    notice,
  }
}
