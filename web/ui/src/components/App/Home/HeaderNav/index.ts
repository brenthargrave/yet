import { h } from "@cycle/react"
import {
  map,
  merge,
  Observable,
  of,
  share,
  switchMap,
  withLatestFrom,
} from "rxjs"
import { makeTagger } from "~/log"
import { push, Route, routes } from "~/router"
import { cb$ } from "~/rx"
import { View } from "./View"

interface BackProps {
  text: string
  target: Route
}

export interface Sources {
  props: {
    back$: Observable<BackProps>
  }
}

export const HeaderNav = (sources: Sources) => {
  const tagScope = `HeaderNav`
  const tag = makeTagger(tagScope)

  const { back$: _back$ } = sources.props
  const back$ = _back$.pipe(tag("back$"), share())

  const [onClickBack, onClickBack$] = cb$(tag("onClickBack$"))
  const goBack$ = onClickBack$.pipe(
    withLatestFrom(back$),
    switchMap(([_, back]) => {
      const { target, text } = back
      return of(push(target))
    }),
    tag("goBack$"),
    share()
  )

  const [onClickAuth, onClickAuth$] = cb$(tag("onClickAuth$"))
  const redirectToAuth$ = onClickAuth$.pipe(
    map((_) => push(routes.in())),
    tag("redirectToAuth$"),
    share()
  )

  const react = back$.pipe(
    switchMap((back) => {
      const { text } = back
      return of(h(View, { onClickAuth, backButtonText: text, onClickBack }))
    }),
    tag("react"),
    share()
  )

  const router = merge(redirectToAuth$, goBack$).pipe(tag("router"), share())

  return {
    react,
    router,
  }
}
