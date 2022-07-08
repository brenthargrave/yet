import { h, ReactSource } from "@cycle/react"
import {
  combineLatest,
  debounceTime,
  distinctUntilChanged,
  map,
  merge,
  Observable,
  pluck,
  share,
  shareReplay,
  skip,
  startWith,
  switchMap,
  takeUntil,
  withLatestFrom,
} from "rxjs"
import { filterResultOk } from "ts-results/rxjs-operators"
import {
  Contact,
  Conversation,
  deleteConversation$,
  Invitee,
  Source as GraphSource,
  upsertConversation$,
} from "~/graph"
import { makeTagger } from "~/log"
import { push, routes, Source as RouterSource } from "~/router"
import { makeObservableCallback } from "~/rx"
import { Option as ContactOption, SelectedOption, View } from "./View"

const contactsToOptions = (contacts: Contact[]): SelectedOption[] =>
  contacts.map(({ id, name }, idx, _) => {
    return { label: name, value: id }
  })
const inviteesToOptions = (invitees: Invitee[]): SelectedOption[] =>
  invitees.map(({ id, name }, idx, _) => {
    return { label: name, value: id }
  })

const optionsToInvitees = (options: ContactOption[]): Invitee[] =>
  options.map(({ label, value }) => {
    return { name: label, id: value }
  })

interface Props {
  id$: Observable<string>
  record$: Observable<Conversation>
}
interface Sources {
  react: ReactSource
  router: RouterSource
  graph: GraphSource
  props: Props
}

export const Form = (sources: Sources, tagPrefix?: string) => {
  const tag = makeTagger(`${tagPrefix}/Form`)

  const {
    graph: { contacts$ },
    router: { history$ },
    props: { record$, id$ },
  } = sources

  const isRecordReady$ = combineLatest({ id: id$, record: record$ }).pipe(
    tag("combine(id, record.id"),
    map(({ id, record }) => id === record.id),
    startWith(false),
    tag("isRecordReady$"),
    shareReplay({ refCount: true, bufferSize: 1 })
  )

  const recordInvitees$ = record$.pipe(pluck("invitees"))
  const inviteesAsOptions$ = recordInvitees$.pipe(
    map(inviteesToOptions),
    tag("inviteesAsOptions$"),
    shareReplay({ refCount: true, bufferSize: 1 })
  )

  const { $: _onSelect$, cb: onSelect } =
    makeObservableCallback<ContactOption[]>()
  const onSelect$ = _onSelect$.pipe(tag("onSelect$"), share())

  const selectedOptions$ = merge(
    inviteesAsOptions$.pipe(takeUntil(onSelect$)),
    onSelect$
  ).pipe(
    tag("selectedOptions$"),
    shareReplay({ refCount: true, bufferSize: 1 })
  )

  const options$ = contacts$.pipe(
    map(contactsToOptions),
    tag("options$"),
    shareReplay({ refCount: true, bufferSize: 1 })
  )
  // TODO: merge in prior selections
  //  combineLatest({
  //   contacts: contacts$.pipe(map(contactsToOptions)),
  //   invitees: inviteesAsOptions$,
  // }).pipe(
  //   map(({ contacts, invitees }) => {
  //     // @ts-ignore
  //     unionWith(eqBy(prop("id")), contacts, invitees)
  //   }),
  //   startWith([]),
  //   tag("options$"),
  //   share()
  // )

  const invitees$ = selectedOptions$.pipe(
    map(optionsToInvitees),
    tag("invitees$"),
    shareReplay({ refCount: true, bufferSize: 1 })
  )

  const recordNote$ = record$.pipe(pluck("note"), tag("recordNote$"), share())
  const { $: _onChangeNote$, cb: onChangeNote } =
    makeObservableCallback<string>()
  const onChangeNote$ = _onChangeNote$.pipe(tag("onChangeNote$"), share())

  const note$ = merge(
    recordNote$.pipe(takeUntil(onChangeNote$)),
    onChangeNote$
  ).pipe(
    distinctUntilChanged(),
    tag("note$"),
    shareReplay({ refCount: true, bufferSize: 1 })
  )

  const payload$ = combineLatest({
    id: id$,
    // TODO: when to sync?
    invitees: invitees$,
    note: note$,
  }).pipe(skip(1), debounceTime(1000), tag("payload$"), share())

  const response$ = payload$.pipe(
    switchMap((input) => upsertConversation$(input)),
    tag("response$"),
    share()
  )

  const isSyncing$ = merge(
    payload$.pipe(map((_) => true)),
    response$.pipe(map((_) => false))
  ).pipe(startWith(false), tag("isSyncing$"), share())

  const { $: _onClickBack$, cb: onClickBack } = makeObservableCallback<void>()
  const goBack$ = _onClickBack$.pipe(tag("onClickBack$"), share())

  const { $: _onClickDelete$, cb: onClickDelete } =
    makeObservableCallback<string>()
  const onClickDelete$ = _onClickDelete$.pipe(tag("onClickDelete$"), share())

  const delete$ = onClickDelete$.pipe(
    withLatestFrom(id$),
    switchMap(([_, id]) => deleteConversation$({ id })),
    tag("delete$"),
    share()
  )
  const deleted$ = delete$.pipe(filterResultOk(), tag("deleted$"), share())

  const isDeleting$: Observable<boolean> = merge(
    onClickDelete$.pipe(map((_) => true)),
    delete$.pipe(map((_) => false))
  ).pipe(startWith(false), tag("isDeleting$"), share())

  const isDeleteDisabled$ = isDeleting$.pipe(
    startWith(false),
    tag("isDeleteDisabled$"),
    share()
  )

  const goToList$ = merge(goBack$, deleted$).pipe(
    map((_) => push(routes.conversations())),
    share()
  )

  const props$ = combineLatest({
    options: options$,
    selectedOptions: selectedOptions$,
    isSyncing: isSyncing$,
    note: note$,
    isDeleting: isDeleting$,
    isDeleteDisabled: isDeleteDisabled$,
    isRecordReady: isRecordReady$,
  }).pipe(tag("props$"))

  const react = props$.pipe(
    map((valueProps) =>
      h(View, {
        ...valueProps,
        onSelect,
        onChangeNote,
        onClickBack,
        onClickDelete,
      })
    )
  )

  const router = merge(goToList$)

  return {
    react,
    router,
  }
}
