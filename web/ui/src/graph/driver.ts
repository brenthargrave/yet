import { Stream } from "xstream"
import { Driver } from "@cycle/run"
import { Observable } from "rxjs"
import { match } from "ts-pattern"
import { adapt } from "@cycle/run/lib/adapt"

import { Customer, setToken, token$, me$ } from "graph"

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
    sink.addListener({
      next: (command) => {
        console.debug(command)
        match(command[0])
          .with(CommandType.in, () => {
            const token = command[1]
            setToken(token)
          })
          .with(CommandType.out, () => {
            setToken(null)
          })
          .exhaustive()
      },
      error: (error) => console.error(error),
      complete: () => console.info("complete"),
    })

    return {
      token$,
      me$,
    }
  }
}
