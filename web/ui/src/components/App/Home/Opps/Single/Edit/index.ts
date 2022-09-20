import { ReactSource } from "@cycle/react"
import { Observable } from "rxjs"
import { Opp, Source as GraphSource } from "~/graph"
import { makeTagger } from "~/log"
import { Form, Target } from "../Form"
import { Location } from ".."

interface Sources {
  react: ReactSource
  graph: GraphSource
  props: {
    record$: Observable<Opp>
    location: Location
  }
}

export const Edit = (sources: Sources, tagPrefix?: string) => {
  const tagScope = `${tagPrefix}/Edit`
  const tag = makeTagger(tagScope)

  const {
    props: { record$, location },
  } = sources

  const form = Form(
    {
      ...sources,
      props: { record$, target: Target.edit, location },
    },
    tagScope
  )

  const { react, notice, action } = form

  return {
    react,
    notice,
    action,
  }
}
