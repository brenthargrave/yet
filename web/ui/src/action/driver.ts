import { Driver } from "@cycle/run"
import { adapt } from "@cycle/run/lib/adapt"
import { Observable, of } from "rxjs"
import { Stream } from "xstream"
import { Action } from "."

type Sink = Stream<Action>

export interface Source {
  action$: Observable<Action>
}

export function makeDriver(): Driver<Sink, Source> {
  return (sink: Sink): Source => {
    // const action$ = adapt(sink)
    // const action$ = of(null)
    const action$ = new Observable<Action>((observer) => {
      sink.addListener({
        next: (action) => observer.next,
        error: (error) => observer.error,
        complete: () => observer.complete,
      })
    })

    return { action$ }
  }
}
