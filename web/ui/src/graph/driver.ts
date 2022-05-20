import { Stream } from "xstream"
import { Driver } from "@cycle/run"
import { adapt } from "@cycle/run/lib/adapt"
import { Observable } from "rxjs"

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
  return function (sink: Sink): Source {
    // sink.addListener
    return adapt(sink)
  }
}
