import { h } from "@cycle/react"
import {
  asyncScheduler,
  combineLatest,
  debounceTime,
  distinctUntilKeyChanged,
  filter,
  map,
  merge,
  mergeMap,
  Observable,
  observeOn,
  pluck,
  scan,
  share,
  startWith,
  switchMap,
  withLatestFrom,
} from "rxjs"
import { isNotNullish } from "rxjs-etc"
import { filterResultErr, filterResultOk } from "ts-results/rxjs-operators"
import { any as _any, append as _append } from "~/fp"
import {
  deleteNote$,
  DraftConversation,
  DraftNote,
  EventName,
  FromView,
  ID,
  Intent,
  newNote,
  NoteStatus,
  postNote$,
  Source as GraphSource,
  track$,
  upsertNote$,
} from "~/graph"
import { makeTagger } from "~/log"
import { cb$, mapTo, noticeFromError$, shareLatest } from "~/rx"
import { AddNoteButton } from "./AddNoteButton"
import { NoteViewModel } from "./Single/View"
import { Props, View } from "./View"

interface Sources {
  graph: GraphSource
  props: {
    conversation$: Observable<DraftConversation>
  }
}

export const Notes = (sources: Sources, _tagPrefix: string) => {
  const tagPrefix = `${_tagPrefix}/Notes`
  const tag = makeTagger(tagPrefix)

  const {
    graph: { me$ },
    props: { conversation$ },
  } = sources

  const recordNotes$ = conversation$.pipe(
    pluck("notes"),
    filter(isNotNullish),
    map((notes) => notes as DraftNote[]),
    tag("recordNotes$", false),
    share()
  )

  const [onClickAdd, onClickAdd$] = cb$(tag("onClickAdd$"))

  const newNote$ = onClickAdd$.pipe(
    withLatestFrom(conversation$),
    map(([_, conversation]) => newNote(conversation.id)),
    tag("newNote$"),
    share()
  )

  const addNote$ = newNote$.pipe(
    switchMap((newNote) => upsertNote$({ ...newNote })),
    tag("addNote$"),
    share()
  )

  const isAdding = merge(
    onClickAdd$.pipe(mapTo(true)),
    addNote$.pipe(mapTo(false))
  ).pipe(startWith(false), tag("isAdding"), share())

  const addedNote$ = addNote$.pipe(filterResultOk(), share())
  const error$ = addNote$.pipe(filterResultErr(), tag("error$"), share())

  const notesWithAddition$ = newNote$.pipe(
    withLatestFrom(recordNotes$),
    map(([newNote, recordNotes]) => {
      const notes = recordNotes as DraftNote[]
      return _append(newNote, notes)
    }),
    tag("notesWithAddition$", false),
    // shareLatest()
    share()
  )

  const notes$ = merge(recordNotes$, notesWithAddition$).pipe(
    tag("notes$", false),
    shareLatest()
  )

  const addNoteErrorNotice$ = noticeFromError$(error$).pipe(
    tag("errorNotice$"),
    share()
  )

  const anyNoteIsDraft = notes$.pipe(
    withLatestFrom(me$),
    map(([notes, me]) => {
      const ownNotes = notes.filter((note) => note.creator?.id === me?.id)
      return _any((note) => note.status === NoteStatus.Draft, ownNotes)
    }),
    startWith(false),
    tag("anyNoteIsDraft"),
    shareLatest()
  )

  // NOTE: don't enable noting until conversation record exists to append to
  const isPersisted = conversation$.pipe(
    map((record) => isNotNullish(record.insertedAt)),
    startWith(false),
    tag("isPersisted"),
    shareLatest()
  )

  const isDisabledAdd = combineLatest({
    isPersisted,
    anyNoteIsDraft,
  }).pipe(
    map(({ isPersisted, anyNoteIsDraft }) => !isPersisted || anyNoteIsDraft),
    startWith(true),
    tag("isDisabledAdd"),
    shareLatest()
  )

  const addButton = combineLatest({ isDisabledAdd, isAdding }).pipe(
    map(({ isDisabledAdd, isAdding }) =>
      h(AddNoteButton, {
        onClickAdd,
        isDisabled: isDisabledAdd,
        isLoading: isAdding,
      })
    ),
    tag("addButton"),
    share()
  )

  const trackAdd$ = onClickAdd$.pipe(
    withLatestFrom(me$, conversation$),
    mergeMap(([_, me, conversation]) =>
      track$({
        customerId: me?.id,
        name: EventName.TapAddNote,
        properties: {
          view: FromView.Conversation,
          intent: Intent.Edit,
        },
      })
    ),
    tag("trackAdd$"),
    share()
  )

  // Edit

  const [onChangeText, onChangeText$] = cb$<{
    text: string | undefined
    id: ID
  }>(tag("onChangeText$"))

  const result$ = onChangeText$.pipe(
    observeOn(asyncScheduler),
    distinctUntilKeyChanged("text"),
    debounceTime(500),
    withLatestFrom(conversation$),
    switchMap(([{ text, id }, { id: conversationId }]) =>
      upsertNote$({
        id,
        conversationId,
        text,
      })
    ),
    tag("result$"),
    share()
  )

  const _ = result$.pipe(filterResultOk(), share())
  const upsertError$ = result$.pipe(
    filterResultErr(),
    tag("upsertError$"),
    share()
  )
  const upsertErrorNotice$ = noticeFromError$(upsertError$).pipe(
    tag("upsertErrorNotice$"),
    share()
  )

  // ActionBar

  // Delete

  const [onClickDelete, onClickDelete$] = cb$<ID>(tag("onClickDelete$"))

  const deleteWithID$ = merge(onClickDelete$).pipe(
    switchMap((id) =>
      deleteNote$({ id }).pipe(
        map((result) => {
          return { id, result }
        })
      )
    ),
    tag("deleteWithID$"),
    share()
  )

  const deletingIDs$ = combineLatest({
    startedID: onClickDelete$,
    resolved: deleteWithID$,
  }).pipe(
    scan((prev, { startedID, resolved }) => {
      prev.add(startedID)
      const { id } = resolved
      prev.delete(id)
      return prev
    }, new Set<ID>()),
    startWith(new Set()),
    tag("deletingIDs$"),
    shareLatest()
  )

  const delete$ = deleteWithID$.pipe(
    map(({ result }) => result),
    tag("delete$"),
    share()
  )
  const deleted$ = delete$.pipe(filterResultOk(), tag("deleted$"), share())
  const deleteError$ = delete$.pipe(
    filterResultErr(),
    tag("deleteError$"),
    share()
  )
  const noticeDelete$ = noticeFromError$(deleteError$)
  const trackDelete$ = deleted$.pipe(
    withLatestFrom(me$),
    mergeMap(([note, me]) =>
      track$({
        customerId: me?.id,
        name: EventName.DeleteNote,
        properties: {
          // TODO? props?
          // conversationId: conversation.id,
        },
      })
    ),
    tag("trackDelete$"),
    share()
  )

  // Post

  const [onClickPost, onClickPost$] = cb$<ID>(tag("onClickPost$"))

  const postWithID$ = merge(onClickPost$).pipe(
    switchMap((id) =>
      postNote$({ id }).pipe(
        map((result) => {
          return { id, result }
        })
      )
    ),
    tag("postWithID$"),
    share()
  )

  const postingIDs$ = combineLatest({
    startedID: onClickPost$,
    resolved: postWithID$,
  }).pipe(
    scan((prev, { startedID, resolved }) => {
      prev.add(startedID)
      prev.delete(resolved.id)
      return prev
    }, new Set<ID>()),
    startWith(new Set()),
    tag("postingIDs$"),
    shareLatest()
  )

  const post$ = deleteWithID$.pipe(
    map(({ result }) => result),
    tag("post$"),
    share()
  )

  const posted$ = delete$.pipe(filterResultOk(), tag("posted$"), share())
  const postError$ = post$.pipe(filterResultErr(), tag("postError$"), share())

  const noticePost$ = noticeFromError$(postError$)
  const trackPost$ = posted$.pipe(
    withLatestFrom(me$),
    mergeMap(([note, me]) =>
      track$({
        customerId: me?.id,
        name: EventName.DeleteNote,
        properties: {
          // TODO? props?
          // conversationId: conversation.id,
        },
      })
    ),
    tag("trackDelete$"),
    share()
  )

  const noteModels$: Observable<NoteViewModel[]> = combineLatest({
    notes: notes$,
    deletingIDsSet: deletingIDs$,
    postingIDsSet: postingIDs$,
  }).pipe(
    map(
      ({
        //
        notes,
        deletingIDsSet,
        postingIDsSet,
      }) => {
        return notes.map((note) => {
          const nvm: NoteViewModel = {
            ...note,
            isDeleting: deletingIDsSet.has(note.id),
            isPosting: postingIDsSet.has(note.id),
          }
          return nvm
        })
      }
    ),
    tag("noteModels$"),
    shareLatest()
  )

  const view = noteModels$.pipe(
    withLatestFrom(conversation$, me$),
    map(([notes, { id: conversationID }, viewer]) => {
      const props: Props = {
        viewer,
        conversationID,
        notes,
        onChangeText,
        onClickDelete,
        onClickPost,
      }
      return h(View, props)
    }),
    tag("react", false),
    share()
  )

  const react = {
    view,
    addButton,
  }

  const track = merge(trackAdd$, trackDelete$, trackPost$)
  const notice = merge(
    addNoteErrorNotice$,
    upsertErrorNotice$,
    noticeDelete$,
    noticePost$
  )

  const isSyncing = merge(
    onChangeText$.pipe(mapTo(true)),
    result$.pipe(mapTo(false))
  ).pipe(startWith(false), tag("isSyncing"), shareLatest())

  const value = {
    isSyncing,
  }

  return {
    react,
    track,
    notice,
    value,
  }
}
