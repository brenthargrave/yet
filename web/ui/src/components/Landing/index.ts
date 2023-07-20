import { h } from "@cycle/react"
import { map, merge, of, share, switchMap } from "rxjs"
import { CC, Sources } from "~/components/App"
import { EventName, track$ } from "~/graph"
import { makeTagger } from "~/log"
import { push, routes } from "~/router"
import { cb$ } from "~/rx"
import { View } from "./View"

export const Landing: CC<Sources> = (sources, _tagScope) => {
  const tagScope = `${_tagScope}/Landing`
  const tag = makeTagger(tagScope)

  const [onClickJoin, onClickJoin$] = cb$(tag("clickJoin$"))
  const join$ = onClickJoin$.pipe(
    map((_) => push(routes.in())),
    tag("onClickJoin$"),
    share()
  )
  const trackJoin$ = join$.pipe(
    switchMap((_) =>
      track$({
        name: EventName.TapSignup,
        properties: {},
      })
    )
  )

  const [onClickLogin, onClickLogin$] = cb$(tag("clickLogin$"))
  const login$ = onClickLogin$.pipe(
    map((_) => push(routes.in())),
    tag("onClickJoin$"),
    share()
  )
  const trackLogin$ = join$.pipe(
    switchMap((_) =>
      track$({
        name: EventName.TapSignin,
        properties: {},
      })
    )
  )

  const react = of(h(View, { onClickJoin, onClickLogin }))
  const router = merge(join$, login$)
  const track = merge(trackJoin$, trackLogin$)

  return {
    react,
    router,
    track,
  }
}
