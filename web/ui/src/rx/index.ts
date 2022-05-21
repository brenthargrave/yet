import { Subject, Observable, share } from "rxjs"
import { Observable as ZenObservable } from "zen-observable-ts"

export type ObservableCallback<O> = [Observable<O>, (t?: any) => void]

export function makeObservableCallback<T>(): ObservableCallback<T> {
  const subject = new Subject<T>()
  const callback = (i: T) => {
    subject.next(i)
  }
  const observable = subject.asObservable().pipe(share())
  return [observable, callback]
}

// NOTE: https://stackoverflow.com/a/66416113
export const zenToRx = <T>(zenObservable: ZenObservable<T>): Observable<T> =>
  new Observable((observer) => zenObservable.subscribe(observer))
