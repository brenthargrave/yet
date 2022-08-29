import { Driver } from "@cycle/run"
import { adapt } from "@cycle/run/lib/adapt"
import { Observable, of, share } from "rxjs"
import { Stream } from "xstream"
import { Action } from "."
import { makeTagger } from "~/log"

const tag = makeTagger("ActionSource")

type Sink = Stream<Action>

export interface Source {
  action$: Observable<Action>
}

export function makeDriver(): Driver<Sink, Source> {
  return (sink: Sink): Source => {
    const action$ = new Observable<Action>((observer) => {
      sink.addListener({
        next: (a) => observer.next(a),
        error: (a) => observer.error(a),
        complete: () => observer.complete(),
      })
    }).pipe(share())

    action$.subscribe()

    return { action$ }
  }
}
