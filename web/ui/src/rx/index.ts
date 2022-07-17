import {
  MonoTypeOperatorFunction,
  Observable,
  share,
  shareReplay,
  Subject,
} from "rxjs"
import { Source as WonkaSource, toObservable } from "wonka"
import { Observable as ZenObservable } from "zen-observable-ts"

export type ObservableCallback<O> = { $: Observable<O>; cb: (t?: any) => void }
export type ObservableCallbackTuple<O> = [(t?: any) => void, Observable<O>]

export function makeObservableCallback<T>(): ObservableCallback<T> {
  const subject = new Subject<T>()
  const callback = (i: T) => {
    subject.next(i)
  }
  const observable = subject.asObservable().pipe(share())
  return { $: observable, cb: callback }
}

export function callback$<T>(
  operator: MonoTypeOperatorFunction<T>
): ObservableCallback<T> {
  const subject = new Subject<T>()
  const callback = (i: T) => {
    subject.next(i)
  }
  const observable = subject.asObservable().pipe(operator, share())
  return { $: observable, cb: callback }
}

export function cb$<T>(
  operator: MonoTypeOperatorFunction<T>
): ObservableCallbackTuple<T> {
  const { cb, $ } = callback$(operator)
  return [cb, $]
}

// NOTE: https://stackoverflow.com/a/66416113
export const zenToRx = <T>(zenObservable: ZenObservable<T>): Observable<T> =>
  new Observable((observer) => zenObservable.subscribe(observer))

export const wonkaToRx = <T>(wonkaObservable: WonkaSource<T>): Observable<T> =>
  // @ts-ignore
  zenToRx(toObservable(wonkaObservable))

export function shareLatest<T>(bufferSize = 1): MonoTypeOperatorFunction<T> {
  return (source) => source.pipe(shareReplay({ refCount: true, bufferSize }))
}
