/* eslint-disable no-console */
import { Driver } from "@cycle/run"
import { captureException } from "@sentry/react"
import { Observable } from "rxjs"
import { match } from "ts-pattern"
import { Stream } from "xstream"
import {
  Contact,
  contacts$,
  conversations$,
  Customer,
  me$,
  opps$,
  profile$,
  setToken,
  token$,
} from "~/graph"
import { Conversation, Opp, ProfileExtended } from "./generated"

type Token = string

export interface Source {
  token$: Observable<Token | null>
  me$: Observable<Customer | null>
  contacts$: Observable<Contact[]>
  conversations$: Observable<Conversation[]>
  opps$: Observable<Opp[]>
  profile$: Observable<ProfileExtended>
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
  return (sink: Sink): Source => {
    sink.addListener({
      next: (command) => {
        match(command[0])
          .with(CommandType.in, () => {
            const token = command[1]
            setToken(token)
          })
          .with(CommandType.out, () => {
            setToken(null)
          })
          .otherwise((res) => console.info(res))
      },
      error: (error) => captureException(error),
      complete: () => console.info("complete"),
    })

    return {
      token$,
      me$,
      contacts$,
      conversations$,
      opps$,
      profile$,
    }
  }
}
