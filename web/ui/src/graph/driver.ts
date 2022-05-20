import { Stream } from "xstream"
import { Driver } from "@cycle/run"
import { adapt } from "@cycle/run/lib/adapt"
import { Observable, of } from "rxjs"
import { match } from "ts-pattern"

import { Customer } from "graph"

export interface Source {
  me$: Observable<Customer | null>
}

type Token = string

enum CommandType {
  in = "in",
  out = "out",
}
type InCommand = [type: CommandType.in, token: Token]
type OutCommand = [type: CommandType.out]

type Commands = InCommand | OutCommand

export const loggedIn = (token: Token): InCommand => [CommandType.in, token]
export const loggedOut = (): OutCommand => [CommandType.out]

type Sink = Stream<Commands>

export function makeDriver(): Driver<Sink, Source> {
  // TODO: token$, client$, me$
  return function (sink: Sink): Source {
    sink.addListener({
      next: (command) => {
        console.debug(command)
        match(command[0])
          .with(CommandType.in, () => {
            const token = command[1]
            // TODO: client.saveTken?
          })
          .with(CommandType.out, () => {
            // clear localStoregae
            // client reset
          })
      },
      error: (error) => console.error(error),
      complete: () => console.info("complete"),
    })
    return {
      me$: of(null),
    }
  }
}
