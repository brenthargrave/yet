import { map, merge, Observable, share, switchMap, withLatestFrom } from "rxjs"
import {
  AuthProvider,
  EventName,
  FromView,
  hrefForSocial,
  ProfileExtended,
  Source as GraphSource,
  track$,
} from "~/graph"
import { makeTagger } from "~/log"
import { cb$ } from "~/rx"

interface Props {
  profile$: Observable<ProfileExtended>
  from: FromView
}

export interface Sources {
  props: Props
  graph: GraphSource
}

export const SocialProfile = (sources: Sources, tagPrefix?: string) => {
  const tagScope = `${tagPrefix}/SocialProfile`
  const tag = makeTagger(tagScope)

  const {
    props: { profile$: _profile$, from },
  } = sources
  const profile$ = _profile$.pipe(tag("profile$"))

  const [onClickSocial, onClickSocial$] = cb$<AuthProvider>(
    tag("onClickSocial$")
  )
  const clickSocial$ = onClickSocial$.pipe(
    withLatestFrom(profile$),
    map(([social, profile]) => {
      const href = hrefForSocial(social, profile)
      window.open(href, "_blank")
      return social
    }),
    tag("clickSocial$"),
    share()
  )
  const trackClickSocial$ = clickSocial$.pipe(
    withLatestFrom(profile$),
    switchMap(([social, profile]) =>
      track$({
        name: EventName.TapSocial,
        properties: {
          authProvider: social,
          view: from,
          socialDistance: profile.socialDistance,
        },
      })
    ),
    tag("trackClickSocial$"),
    share()
  )

  const track = merge(trackClickSocial$)
  const value = { onClickSocial }

  return {
    track,
    value,
  }
}
