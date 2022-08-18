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
import { ID } from "~/graph"
import { makeTagger } from "~/log"
import { shareLatest } from "~/rx"

const tagPrefix = "Router"
const tag = makeTagger(tagPrefix)

export const NEWID: ID = "new"

const root = defineRoute("/")
const conversations = root.extend("/c")
const conversation = conversations.extend(
  { id: param.path.string },
  (p) => `/${p.id}`
)
const signConversation = conversation.extend("/sign")
const conversationOpps = conversation.extend("/o")
const conversationOpp = conversationOpps.extend(
  { oid: param.path.string },
  (p) => `/${p.oid}`
)
const opps = root.extend("/o")
const opp = opps.extend({ oid: param.path.string }, (p) => `/${p.oid}`)

export const { routes, useRoute, RouteProvider, session } = createRouter({
  in: defineRoute("/in"),
  out: defineRoute("/out"),
  root,
  conversations,
  conversation,
  signConversation,
  conversationOpps,
  conversationOpp,
  opps,
  opp,
})

export const routesOppsList = [routes.conversationOpps, routes.opps]
export const routeGroupOppsList = createGroup(routesOppsList)
export const routesOpp = [routes.conversationOpp, routes.opp]
export const routeGroupOpp = createGroup(routesOpp)

export const singleConversationRoutesGroup = createGroup([
  routes.conversation,
  routes.signConversation,
  routes.conversationOpp,
  routes.conversationOpps,
])
export const singleConversationOppRoutesGroup = createGroup([
  routes.conversationOpp,
])

export const newConversationRouteGroup = createGroup([
  routes.conversation,
  routes.conversationOpp,
])

export const conversationOppsRouteGroup = createGroup([
  routes.conversationOpp,
  routes.conversationOpps,
])

export const anyConversationsRouteGroup = createGroup([
  routes.conversations,
  routes.conversation,
  routes.signConversation,
  routes.conversationOpps,
  routes.conversationOpp,
])
export const anyRootOppsRouteGroup = createGroup([routes.opps, routes.opp])

export type Route = _Route<typeof routes>

export const routeURL = (route: Route): string =>
  new URL(route.href, window.location.origin).href

export const isRoute = (route: Route, expectedRoute: Route): boolean =>
  route.name === expectedRoute.name

export const isNewConversationRoute = (route?: Route | null): boolean => {
  if (route) {
    return newConversationRouteGroup.has(route) && route.params.id === NEWID
  }
  return false
}

export const isConversationNewOppRoute = (route?: Route | null): boolean => {
  if (route) {
    return (
      route.name === routes.conversationOpp.name && route.params.oid === NEWID
    )
  }
  return false
}

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
