import { Stream } from "xstream"
import { Driver } from "@cycle/run"
import { adapt } from "@cycle/run/lib/adapt"
import { Observable, of, BehaviorSubject } from "rxjs"
import { match } from "ts-pattern"

import { Customer } from "graph"
import { tokenCacheKey } from "./apollo"

type Token = string

export interface Source {
  token$: Observable<Token | null>
  me$: Observable<Customer | null>
}

enum CommandType {
  in = "in",
  out = "out",
}
type InCommand = [type: CommandType.in, token: Token]
type OutCommand = [type: CommandType.out]

export type Commands = InCommand | OutCommand

export const loggedIn = (token: Token): InCommand => [CommandType.in, token]
export const loggedOut = (): OutCommand => [CommandType.out]

type Sink = Stream<Commands>

export function makeDriver(): Driver<Sink, Source> {
  return function (sink: Sink): Source {
    const token$$ = new BehaviorSubject<string | null>(
      localStorage.getItem(tokenCacheKey)
    )
    const token$ = token$$.asObservable()
    const me$ = of(null) // TODO: graph.me$(), make contingent on token$ to ensure availble

    sink.addListener({
      next: (command) => {
        console.debug(command)
        match(command[0])
          .with(CommandType.in, () => {
            const token = command[1]
            if (token) {
              localStorage.setItem(tokenCacheKey, token)
              token$$.next(token)
            }
          })
          .with(CommandType.out, () => {
            localStorage.clear()
            token$$.next(null)
            // TODO: client reset
          })
          .exhaustive()
      },
      error: (error) => console.error(error),
      complete: () => console.info("complete"),
    })
    return {
      token$,
      me$: of(null),
    }
  }
}
