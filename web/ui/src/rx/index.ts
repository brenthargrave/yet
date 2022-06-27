import { Subject, Observable, share, OperatorFunction } from "rxjs"
import { Observable as ZenObservable } from "zen-observable-ts"

export type ObservableCallback<O> = { $: Observable<O>; cb: (t?: any) => void }

export function makeObservableCallback<T>(
  tagFn?: OperatorFunction<T, T>
): ObservableCallback<T> {
  const subject = new Subject<T>()
  const callback = (i: T) => {
    subject.next(i)
  }
  // TODO: include tag
  // const observable = isNil(tagFn)
  //   ? subject.asObservable().pipe(share())
  //   : subject.asObservable().pipe(tagFn, share())
  const observable = subject.asObservable().pipe(share())
  return { $: observable, cb: callback }
}

// NOTE: https://stackoverflow.com/a/66416113
export const zenToRx = <T>(zenObservable: ZenObservable<T>): Observable<T> =>
  new Observable((observer) => zenObservable.subscribe(observer))
