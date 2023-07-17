import { h } from "@cycle/react"
import { combineLatest, map, merge, Observable } from "rxjs"
import { makeTagger } from "~/log"
import { cb$, shareLatest } from "~/rx"
import { Props as ViewProps, View } from "./View"

interface Props extends Omit<ViewProps, "onChange"> {
  prior$: Observable<string>
}

export interface Sources {
  props: Props
}

export const TextInput = (sources: Sources, tagPrefix?: string) => {
  const tagScope = `${tagPrefix}/TextInput`
  const tag = makeTagger(tagScope)

  const {
    props: { prior$, placeholder, autoFocus },
  } = sources

  const [onChange, onChange$] = cb$<string>(tag("onChange$"))

  const value = merge(prior$, onChange$).pipe(tag(`value$`), shareLatest())

  const props$: Observable<ViewProps> = combineLatest({
    defaultValue: prior$,
  }).pipe(tag("props$"), shareLatest())

  const react = props$.pipe(
    map((props) => h(View, { ...props, placeholder, autoFocus, onChange }))
  )

  return {
    react,
    value,
  }
}
