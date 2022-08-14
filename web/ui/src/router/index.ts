import { Driver } from "@cycle/run"
import { captureException } from "@sentry/react"
import { distinctUntilChanged, Observable } from "rxjs"
import { match } from "ts-pattern"
import {
  createGroup,
  createRouter,
  defineRoute,
  param,
  Route as _Route,
} from "type-route"
import { Stream } from "xstream"
import { includes, isEmpty } from "~/fp"
import { makeTagger } from "~/log"
import { shareLatest } from "~/rx"

const tagPrefix = "Router"
const tag = makeTagger(tagPrefix)

const root = defineRoute("/")
const conversations = root.extend("/c")
const newConversation = conversations.extend("/new")
const conversation = conversations.extend(
  { id: param.path.string },
  (p) => `/${p.id}`
)
const editConversation = conversation.extend("/edit")
const signConversation = conversation.extend("/sign")
const newConversationOpps = newConversation.extend("/o")
const newConversationNewOpp = newConversationOpps.extend("/new")
const newConversationOpp = newConversationOpps.extend(
  { id: param.path.string },
  (p) => `/${p.id}`
)
const opps = root.extend("/o")
const opp = opps.extend({ id: param.path.string }, (p) => `/${p.id}`)

export const { routes, useRoute, RouteProvider, session } = createRouter({
  in: defineRoute("/in"),
  out: defineRoute("/out"),
  root,
  conversations,
  newConversation,
  conversation,
  editConversation,
  signConversation,
  newConversationOpps,
  newConversationNewOpp,
  newConversationOpp,
  opps,
  opp,
})

const newConversationOppsRoutes = [
  routes.newConversationOpps,
  routes.newConversationNewOpp,
  routes.newConversationOpp,
]
export const newConversationOppsRoutesGroup = createGroup(
  newConversationOppsRoutes
)
export const newConversationRoutesGroup = createGroup([
  ...newConversationOppsRoutes,
  routes.newConversation,
])

export type Route = _Route<typeof routes>

export const routeURL = (route: Route): string =>
  new URL(route.href, window.location.origin).href

export const isRoute = (route: Route, expectedRoute: Route): boolean =>
  route.name === expectedRoute.name

export const isNewConversationRoute = (route?: Route | null): boolean =>
  route ? includes(route.name, newConversationRoutesGroup.routeNames) : false

export interface Source {
  history$: Observable<Route>
}

export enum CommandType {
  push = "push",
  back = "back",
  replace = "replace",
}
export interface Command {
  type: CommandType
  route?: Route
}
export const push = (route: Route): Command => {
  return { type: CommandType.push, route }
}
export const back = (): Command => {
  return { type: CommandType.back }
}
export const replace = (): Command => {
  return { type: CommandType.replace }
}

type Sink = Stream<Command>

export function makeDriver(): Driver<Sink, Source> {
  return (sink: Sink): Source => {
    sink.addListener({
      next: (cmd) => {
        const { type, route } = cmd
        match(type)
          .with(CommandType.push, () => route?.push())
          .with(CommandType.back, () => window.history.back())
          .with(CommandType.replace, () => route?.replace())
          .exhaustive()
      },
      error: (error) => captureException(error),
      complete: () => null,
    })

    const history$ = new Observable<Route>((observer) => {
      observer.next(session.getInitialRoute())
      const unlisten = session.listen((route) => {
        observer.next(route)
      })
      return unlisten
    }).pipe(
      distinctUntilChanged((prev, curr) => prev.href === curr.href),
      tag("history$"),
      shareLatest()
    )

    return {
      history$,
    }
  }
}
