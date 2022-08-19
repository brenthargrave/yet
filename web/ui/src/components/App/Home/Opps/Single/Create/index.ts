import { ReactSource } from "@cycle/react"
import { Observable, of, switchMap } from "rxjs"
import { equals } from "rxjs-etc/dist/esm/operators"
import { newOpp, Source as GraphSource } from "~/graph"
import { makeTagger } from "~/log"
import { shareLatest } from "~/rx"
import { State, Location } from "../.."
import { Form, Target } from "../Form"

interface Props {
  state$: Observable<State>
  location: Location
}

interface Sources {
  react: ReactSource
  graph: GraphSource
  props: Props
}

export const Create = (sources: Sources, tagPrefix?: string) => {
  const tagScope = `${tagPrefix}/Create`
  const tag = makeTagger(tagScope)

  const {
    props: { state$, location },
  } = sources

  const record$ = state$.pipe(
    equals(State.create),
    switchMap((_) => of(newOpp())),
    tag("record$"),
    shareLatest()
  )

  const { react, notice, action } = Form(
    {
      ...sources,
      props: { record$, target: Target.create, location },
    },
    tagScope
  )

  return {
    react,
    notice,
    action,
  }
}
