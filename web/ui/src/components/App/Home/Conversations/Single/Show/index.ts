import { h, ReactSource } from "@cycle/react"
import {
  combineLatest,
  distinctUntilChanged,
  map,
  merge,
  Observable,
  of,
  share,
  startWith,
  switchMap,
  withLatestFrom,
} from "rxjs"
import { filterResultOk } from "ts-results/rxjs-operators"
import {
  Conversation,
  deleteConversation$,
  Source as GraphSource,
} from "~/graph"
import { makeTagger } from "~/log"
import { push, Source as RouterSource, routes } from "~/router"
import { cb$, shareLatest } from "~/rx"
import { Intent, View, Props } from "../View"
import { Notes } from "~/components/Notes"

interface Sources {
  react: ReactSource
  router: RouterSource
  graph: GraphSource
  props: {
    record$: Observable<Conversation>
  }
}

export const Show = (sources: Sources, tagPrefix?: string) => {
  const {
    graph: { me$ },
    props: { record$: _record$ },
  } = sources

  const tagScope = `${tagPrefix}/Show`
  const tag = makeTagger(tagScope)

  const record$ = _record$.pipe(tag("record$"), shareLatest())

  const [onClickBack, onClickBack$] = cb$(tag("onClickBack$"))

  // TODO: dedupe w/ Form
  const [onClickShare, onClickShare$] = cb$(tag("onClickShare$"))
  const [onCloseShare, onCloseShare$] = cb$(tag("onCloseShare$"))
  const isOpenShare$ = merge(
    onClickShare$.pipe(map((_) => true)),
    onCloseShare$.pipe(map((_) => false))
  ).pipe(startWith(false), tag("isOpenShare$"), shareLatest())

  // delete conversation
  const [onClickDelete, onClickDelete$] = cb$(tag("onClickDelete$"))
  const delete$ = merge(onClickDelete$).pipe(
    withLatestFrom(record$),
    switchMap(([_, record]) => deleteConversation$({ id: record.id })),
    tag("delete$"),
    share()
  )
  const deleted$ = delete$.pipe(filterResultOk(), tag("deleted$"), share())
  const goToList$ = merge(onClickBack$, deleted$).pipe(
    map((_) => push(routes.conversations())),
    tag("goToList$"),
    share()
  )
  const isDeleting$: Observable<boolean> = merge(
    onClickDelete$.pipe(map((_) => true)),
    delete$.pipe(map((_) => false))
  ).pipe(
    startWith(false),
    distinctUntilChanged(),
    tag("isDeleting$"),
    shareLatest()
  )

  const notes = Notes(
    {
      ...sources,
      props: {
        conversation$: record$,
      },
    },
    tagScope
  )

  const props$: Observable<Props> = combineLatest({
    viewer: me$,
    intent: of(Intent.Read),
    conversation: record$,
    isOpenShare: isOpenShare$,
    isDeleting: isDeleting$,
    notesView: notes.react.view,
    addButton: notes.react.addButton,
  }).pipe(
    map((props) => {
      return {
        ...props,
        onClickShare,
        onCloseShare,
        onClickBack,
        onClickDelete,
      }
    }),
    tag("props$")
  )

  const react = props$.pipe(
    map((props) => h(View, props)),
    tag("react"),
    share()
  )

  const router = merge(
    //
    goToList$
  )
  const { notice, track } = notes

  return {
    router,
    react,
    notice,
    track,
  }
}
