import {
  Subject,
  Observable,
  share,
  OperatorFunction,
  shareReplay,
  MonoTypeOperatorFunction,
} from "rxjs"
import { Observable as ZenObservable } from "zen-observable-ts"

export type ObservableCallback<O> = { $: Observable<O>; cb: (t?: any) => void }

export function makeObservableCallback<T>(): ObservableCallback<T> {
  const subject = new Subject<T>()
  const callback = (i: T) => {
    subject.next(i)
  }
  const observable = subject.asObservable().pipe(share())
  return { $: observable, cb: callback }
}

// NOTE: https://stackoverflow.com/a/66416113
export const zenToRx = <T>(zenObservable: ZenObservable<T>): Observable<T> =>
  new Observable((observer) => zenObservable.subscribe(observer))

// export function shareLatest<T, R>(
//   bufferSize?: 1,
//   operator?: (source: Observable<T>) => Observable<R>
// ): OperatorFunction<T, T | R> {
//   return (source) => source.pipe(shareReplay({ refCount: true, bufferSize }))
// }

export function shareLatest<T>(bufferSize = 1): MonoTypeOperatorFunction<T> {
  return (source) => source.pipe(shareReplay({ refCount: true, bufferSize }))
}
