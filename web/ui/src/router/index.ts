import type { Route as _Route } from "type-route"
import { createRouter, defineRoute } from "type-route"
import { Observable } from "rxjs"
import { shareReplay } from "rxjs/operators"
import { Stream } from "xstream"
import { Driver } from "@cycle/run"
import { adapt } from "@cycle/run/lib/adapt"
import { match } from "ts-pattern"

export const { routes, useRoute, RouteProvider, session } = createRouter({
  root: defineRoute("/"),
  in: defineRoute("/in"),
  out: defineRoute("/out"),
  verify: defineRoute("/verify"),
})

export type Route = _Route<typeof routes>

// export const isRoute = (route: Route, expectedRoute: Route): boolean =>
//   route.name === expectedRoute.name

// export const history$ = new Observable<Route>((observer) => {
//   observer.next(session.getInitialRoute())
//   const unlisten = session.listen((route) => {
//     observer.next(route)
//   })
//   return unlisten
// }).pipe(shareReplay())

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

export function makeRouterDriver(): Driver<Sink, Source> {
  return function (sink: Sink): Source {
    // TODO: swallow errors?
    sink.addListener({
      next: (command) => {
        console.debug(command)
        match(command.type)
          .with(CommandType.push, () => command.route?.push())
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
    }).pipe(shareReplay())

    return {
      history$, // TODO: adapt()
    }
  }
}
