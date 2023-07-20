import { h } from "@cycle/react"
import { combineLatest, map, merge, Observable, startWith } from "rxjs"
import { isEmpty } from "~/fp"
import { makeTagger } from "~/log"
import { cb$, shareLatest } from "~/rx"
import { Props as ViewProps, View } from "./View"
import type { InputType } from "./View"

interface Props
  extends Omit<
    ViewProps<InputType>,
    "onChange" | "value" | "defaultValue" | "errorMessage"
  > {
  prior$: Observable<InputType>
  minimumCharacters?: number
  size?: string
}

export interface Sources {
  props: Props
}

export const TextInput = (
  sources: Sources,
  tagPrefix: string,
  focus = false
) => {
  const tagScope = `${tagPrefix}/TextInput`
  const tag = makeTagger(tagScope)

  const {
    props: { prior$, placeholder, autoFocus, minimumCharacters, label, size },
  } = sources

  const [onChange, onChange$] = cb$<string>(tag("onChange$"))

  const value = merge(prior$, onChange$).pipe(tag(`value$`), shareLatest())

  const isInvalid = value.pipe(
    map((value) => {
      if (minimumCharacters) {
        if (!value) return true
        return isEmpty(value) || value.length < minimumCharacters
      }
      return false
    }),
    startWith(false),
    tag("isInvalid"),
    shareLatest()
  )
  const errorMessage = isInvalid.pipe(
    map((isInvalid) => {
      return isInvalid ? `At least ${minimumCharacters} characters` : null
    }),
    tag("errorMessage"),
    shareLatest()
  )

  const props$ = combineLatest({
    defaultValue: prior$,
    isInvalid,
    errorMessage,
  }).pipe(tag("props$"), shareLatest())

  const react = props$.pipe(
    map((props) =>
      h(View, {
        ...props,
        label,
        placeholder,
        autoFocus,
        onChange,
        size,
      })
    )
  )

  return {
    react,
    value,
    isInvalid,
  }
}
