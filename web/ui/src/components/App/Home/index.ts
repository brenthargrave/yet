import { h, ReactSource } from "@cycle/react"
import {
  share,
  combineLatest,
  map,
  switchMap,
  distinctUntilChanged,
} from "rxjs"
import { Onboarding } from "~/components/Onboarding"
import { isAuthenticated, isOnboarding, Source as GraphSource } from "~/graph"
import { makeTagger } from "~/log"
import { Source as RouterSource } from "~/router"
import { Conversations } from "./Conversations"
import { View } from "./View"

interface Sources {
  react: ReactSource
  router: RouterSource
  graph: GraphSource
}

export const Home = (sources: Sources) => {
  const tagScope = "Home"
  const tag = makeTagger(tagScope)

  const {
    graph: { me$: me },
  } = sources

  // NOTE: force onboarding everywhere in main app after auth
  const onboarding = Onboarding(sources)

  const { react: conversationsView$, ...conversations } = Conversations(
    sources,
    tagScope
  )

  const rootView$ = conversationsView$.pipe(
    map((subview) => h(View, [subview])),
    tag("rootView$")
  )

  const react = combineLatest({ me }).pipe(
    switchMap(({ me }) =>
      isAuthenticated(me) && isOnboarding(me) ? onboarding.react : rootView$
    ),
    share()
  )

  return {
    react,
    ...conversations,
  }
}
