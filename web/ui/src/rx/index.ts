import { Subject, Observable } from "rxjs"

export type ObservableCallback<O> = [Observable<O>, (t?: any) => void]

export function makeObservableCallback<T>(): ObservableCallback<T> {
  const subject = new Subject<T>()
  const observable = subject.asObservable()
  const callback = (i: T) => {
    subject.next(i)
  }
  return [observable, callback]
}
