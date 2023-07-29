/* eslint no-console: 0 */

import { captureException, withScope } from "@sentry/react"
import {
  catchError,
  EMPTY,
  map,
  merge,
  MonoTypeOperatorFunction,
  Observable,
  OperatorFunction,
  share,
  shareReplay,
  Subject,
} from "rxjs"
import { Source as WonkaSource, toObservable } from "wonka"
import { Observable as ZenObservable } from "zen-observable-ts"
import { partitionError$ } from "~/graph"
import { reportException } from "~/graph/operations"
import { t } from "~/i18n"
import { error } from "~/notice"
import { toast } from "~/toast"

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

export const mapTo =
  <T, R>(result: R): OperatorFunction<T, R> =>
  (source) =>
    source.pipe(map((_) => result))

// NOTE: https://stackoverflow.com/a/66416113
export const zenToRx = <T>(zenObservable: ZenObservable<T>): Observable<T> =>
  new Observable((observer) => zenObservable.subscribe(observer))

export const wonkaToRx = <T>(wonkaObservable: WonkaSource<T>): Observable<T> =>
  // @ts-ignore
  zenToRx(toObservable(wonkaObservable))

export function shareLatest<T>(bufferSize = 1): MonoTypeOperatorFunction<T> {
  return (source) => source.pipe(shareReplay({ refCount: true, bufferSize }))
}

// TODO: mergeProp("sink", source1, source2, ...)
// export const mergeProp = (prop: string, ...sources: []) =>
//   merge(...pluck(prop, sources))

export const noticeFromError$ = (error$: Observable<Error>) => {
  const { appError$, userError$ } = partitionError$(error$)
  const userErrorNotice = userError$.pipe(
    map(({ message }) => error({ description: message }))
  )
  const appErrorNotice = appError$.pipe(
    map(({ message }) =>
      error({
        title: t("default.error.title"),
        description: t("default.error.description"),
      })
    )
  )
  return merge(userErrorNotice, appErrorNotice)
}

export function swallowError<T>(
  callback?: (error: Error, caught: Observable<T>) => void
): MonoTypeOperatorFunction<T> {
  return (source) =>
    source.pipe(
      catchError((error, caught$) => {
        console.error(error)
        // custom handling
        if (callback) callback(error, caught$)
        reportException(error)
        // display an error notice
        toast({
          title: t("default.error.title"),
          description: t("default.error.description"),
          status: "error",
        })
        // swallow error
        return EMPTY
      })
    )
}
