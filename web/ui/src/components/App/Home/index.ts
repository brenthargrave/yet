import { h, ReactSource } from "@cycle/react"
import { combineLatest, map, switchMap } from "rxjs"
import { Onboarding } from "~/components/Onboarding"
import { isAuthenticated, isOnboarding, Source as GraphSource } from "~/graph"
import { makeTagger } from "~/log"
import { Source as RouterSource } from "~/router"
import { Conversations } from "./Conversations"
import { View } from "./View"

const tag = makeTagger("Home")

interface Sources {
  react: ReactSource
  router: RouterSource
  graph: GraphSource
}

export const Home = (sources: Sources) => {
  const tagScope = "Home"
  const {
    graph: { me$: me },
  } = sources

  // NOTE: force onboarding everywhere in app, but only if auth'd
  // unauthenticated on *some* subviews... should what?
  const onboarding = Onboarding(sources)

  const {
    react: conversationsView$,
    router,
    track,
    notice,
  } = Conversations(sources, tagScope)

  const rootView$ = conversationsView$.pipe(
    map((subview) => h(View, [subview])),
    tag("rootView$")
  )

  const react = combineLatest({ me }).pipe(
    switchMap(({ me }) =>
      isAuthenticated(me) && isOnboarding(me) ? onboarding.react : rootView$
    )
  )

  return {
    react,
    router,
    track,
    notice,
  }
}
