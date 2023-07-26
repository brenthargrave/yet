import { Driver } from "@cycle/run"
import { captureException } from "@sentry/react"
import { Stream } from "xstream"
import { makeTagger } from "~/log"

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
      error: (error) => captureException(error),
      complete: () => console.info("complete"),
    })

    return {}
  }
}
