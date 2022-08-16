import { h, ReactSource } from "@cycle/react"
import {
  combineLatest,
  distinctUntilChanged,
  map,
  merge,
  share,
  switchMap,
} from "rxjs"
import { match } from "ts-pattern"
import { Source as ActionSource } from "~/action"
import { Onboarding } from "~/components/Onboarding"
import { isAuthenticated, isOnboarding, Source as GraphSource } from "~/graph"
import { makeTagger } from "~/log"
import { Source as RouterSource } from "~/router"
import { Conversations } from "./Conversations"
import { View } from "./View"
import { pluck } from "~/fp"

enum State {
  onboarding = "onboarding",
  root = "root",
}

interface Sources {
  react: ReactSource
  router: RouterSource
  graph: GraphSource
  action: ActionSource
}

export const Home = (sources: Sources) => {
  const tagScope = "Home"
  const tag = makeTagger(tagScope)

  const {
    graph: { me$: me },
  } = sources

  // NOTE: force onboarding everywhere in main app after auth
  const onboarding = Onboarding(sources)

  const conversations = Conversations(sources, tagScope)

  const rootView$ = conversations.react.pipe(
    map((subview) => h(View, [subview])),
    tag("rootView$")
  )

  const state$ = combineLatest({ me }).pipe(
    map(({ me }) =>
      isAuthenticated(me) && isOnboarding(me) ? State.onboarding : State.root
    ),
    distinctUntilChanged(),
    tag("state$"),
    share()
  )

  const react = state$.pipe(
    switchMap((state) =>
      match(state)
        .with(State.onboarding, () => onboarding.react)
        .with(State.root, () => rootView$)
        .exhaustive()
    ),
    tag("react"),
    share()
  )

  const router = merge(...pluck("router", [conversations]))
  const track = merge(...pluck("track", [conversations]))
  const notice = merge(...pluck("notice", [conversations]))
  const graph = merge(...pluck("graph", [conversations]))

  return {
    react,
    router,
    track,
    notice,
    graph,
  }
}
