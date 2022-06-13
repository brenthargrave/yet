import { Driver } from "@cycle/run"
import { Observable } from "rxjs"
import { shareReplay } from "rxjs/operators"
import { match } from "ts-pattern"
import { param, Route as _Route, createRouter, defineRoute } from "type-route"
import { Stream } from "xstream"
import { makeTagger } from "~/log"
import { TrackEventMutation } from "~/graph"

export interface Source {}

const tag = makeTagger("Router")
type Sink = Stream<any>

export function makeDriver(): Driver<Sink, Source> {
  return function (sink: Sink): Source {
    sink.addListener({
      next: (result) => {
        // match(type)
        //   .with(CommandType.push, () => route?.push())
        //   .exhaustive()
      },
      error: (error) => console.error(error),
      complete: () => console.info("complete"),
    })

    return {}
  }
}
