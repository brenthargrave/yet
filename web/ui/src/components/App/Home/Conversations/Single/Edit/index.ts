import { ReactSource } from "@cycle/react"
import {
  combineLatest,
  filter,
  map,
  merge,
  Observable,
  pluck,
  share,
} from "rxjs"
import { Source as ActionSource } from "~/action"
import { Conversation, Source as GraphSource } from "~/graph"
import { makeTagger } from "~/log"
import { push, routes, Source as RouterSource } from "~/router"
import { shareLatest } from "~/rx"
import { Form, Mode } from "../Form"

interface Props {
  record$: Observable<Conversation>
}

interface Sources {
  react: ReactSource
  router: RouterSource
  graph: GraphSource
  action: ActionSource
  props: Props
}

export const Main = (sources: Sources, tagPrefix?: string) => {
  const {
    router: { history$ },
    graph: { me$ },
    props: { record$ },
  } = sources

  const tagScope = `${tagPrefix}/Edit`
  const tag = makeTagger(tagScope)

  const id$ = record$.pipe(pluck("id"), tag("id$"), shareLatest())

  const redirectNonCreatorsToShow$ = combineLatest({
    me: me$,
    record: record$,
  }).pipe(
    filter(({ me, record }) => record.creator.id !== me?.id),
    map(({ me, record }) => push(routes.conversation({ id: record.id }))),
    tag("redirectNonCreatorToShow$"),
    share()
  )

  const {
    react,
    router: formRouter$,
    notice: formNotice$,
    track,
    graph,
  } = Form(
    {
      ...sources,
      props: { id$, record$ },
    },
    tagScope,
    Mode.edit
  )

  const router = merge(formRouter$, redirectNonCreatorsToShow$)
  const notice = merge(formNotice$)

  return {
    react,
    notice,
    router,
    track,
    graph,
  }
}
