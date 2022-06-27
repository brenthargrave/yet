import { Subject, Observable, share, OperatorFunction } from "rxjs"
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
