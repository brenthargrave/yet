import { ReactSource } from "@cycle/react"
import {
  delay,
  merge,
  mergeMap,
  share,
  startWith,
  switchMap,
  tap,
  zip,
} from "rxjs"
import {
  AuthProvider,
  EventName,
  FromView,
  Source as GraphSource,
  track$,
} from "~/graph"
import { makeTagger } from "~/log"
import { cb$, mapTo, shareLatest } from "~/rx"

interface Props {
  provider: AuthProvider
  from: FromView
}

interface Sources {
  react: ReactSource
  graph: GraphSource
}

export const AuthService = (
  { graph: { me$: _me$ } }: Sources,
  props: Props,
  tagPrefix?: string
) => {
  const { provider, from } = props
  const tag = makeTagger(`${tagPrefix}/AuthService/${provider}`)

  const [onClickAuth, clickAuth$] = cb$(tag("clickAuth$"))
  const trackTapAuth$ = clickAuth$.pipe(
    mergeMap((_auth) =>
      track$({
        name: EventName.TapAuthorize,
        properties: {
          authProvider: provider,
          view: from,
        },
      })
    ),
    tag("trackTapAuth$"),
    share()
  )

  const redirectToAuth$ = trackTapAuth$.pipe(
    tap((_) => {
      const providerLower = provider.toLowerCase()
      const path = `/auth/${providerLower}`
      // const target = "_blank"
      const target = "_self"
      window.open(path, target)
    }),
    tag("redirectToAuth$"),
    share()
  )

  const authPending = merge(
    clickAuth$.pipe(mapTo(true)),
    redirectToAuth$.pipe(delay(5000), mapTo(false))
  ).pipe(
    //
    startWith(false),
    tag("authPending$"),
    shareLatest()
  )

  const track = merge(trackTapAuth$)
  const value = { onClickAuth, authPending }

  return {
    track,
    value,
  }
}
