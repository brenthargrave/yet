import { Subject, Observable, share } from "rxjs"

export type ObservableCallback<O> = [Observable<O>, (t?: any) => void]

export function makeObservableCallback<T>(): ObservableCallback<T> {
  const subject = new Subject<T>()
  const callback = (i: T) => {
    subject.next(i)
  }
  const observable = subject.asObservable().pipe(share())
  return [observable, callback]
}
