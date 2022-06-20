import { Driver } from "@cycle/run"
import { Observable } from "rxjs"
import { shareReplay } from "rxjs/operators"
import { match } from "ts-pattern"
import { param, Route as _Route, createRouter, defineRoute } from "type-route"
import { Stream } from "xstream"
import { makeTagger } from "~/log"

const tag = makeTagger("Router")

const root = defineRoute("/")
const conversations = root.extend("/c")
const createConversation = conversations.extend("/new")
const editConversation = conversations.extend(
  { cid: param.path.string },
  (p) => `/${p.cid}/edit`
)

export const { routes, useRoute, RouteProvider, session } = createRouter({
  in: defineRoute("/in"),
  out: defineRoute("/out"),
  root,
  conversations,
  editConversation,
  notes: defineRoute("/notes"),
})

export type Route = _Route<typeof routes>

export const isRoute = (route: Route, expectedRoute: Route): boolean =>
  route.name === expectedRoute.name

export interface Source {
  history$: Observable<Route>
}

export enum CommandType {
  push = "push",
}
export interface Command {
  type: CommandType
  route?: Route
}
export const push = (route: Route): Command => {
  return { type: CommandType.push, route }
}

type Sink = Stream<Command>

export function makeDriver(): Driver<Sink, Source> {
  return function (sink: Sink): Source {
    sink.addListener({
      next: ({ type, route }) => {
        match(type)
          .with(CommandType.push, () => route?.push())
          .exhaustive()
      },
      error: (error) => console.error(error),
      complete: () => console.info("complete"),
    })

    const history$ = new Observable<Route>((observer) => {
      observer.next(session.getInitialRoute())
      const unlisten = session.listen((route) => {
        observer.next(route)
      })
      return unlisten
    }).pipe(tag("history$"), shareReplay({ bufferSize: 1, refCount: true }))

    return {
      history$,
    }
  }
}
