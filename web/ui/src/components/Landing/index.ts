import { h } from "@cycle/react"
import { of } from "rxjs"
import { CC, Sources } from "~/components/App"
import { EventName, track } from "~/graph"
import { routes } from "~/router"
import { cb$ } from "~/rx"
import { View } from "./View"
import { makeTagger } from "~/log"

export const Landing: CC<Sources> = (sources, _tagScope) => {
  const tagScope = `${_tagScope}/Landing`
  const tag = makeTagger(tagScope)

  const [onClickEdit, onClickEdit$] = cb$(tag("clickEdit$"))

  const onClickJoin = async () => {
    routes.in().push()
    const _event = await track(EventName.TapSignup)
  }

  const onClickLogin = () => routes.in().push()

  const react = of(h(View, { onClickJoin, onClickLogin }))

  return {
    react,
  }
}
