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

interface Props {
  record$: Observable<Conversation>
}

interface Sources {
  react: ReactSource
  router: RouterSource
  graph: GraphSource
  props: Props
}

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

export const Form = (sources: Sources, tagPrefix?: string) => {
  const tag = makeTagger(`${tagPrefix}/Form`)

  const {
    graph: { contacts$ },
    router: { history$ },
    props: { record$ },
  } = sources

  const id$ = record$.pipe(pluck("id"), tag("id$"), shareReplay())

  const recordInvitees$ = record$.pipe(pluck("invitees"))
  const inviteesAsOptions$ = recordInvitees$.pipe(
    map(inviteesToOptions),
    tag("inviteesAsOptions$"),
    shareReplay()
  )

  const { $: _onSelect$, cb: onSelect } =
    makeObservableCallback<ContactOption[]>()
  const onSelect$ = _onSelect$.pipe(tag("onSelect$"), shareReplay())

  const selectedOptions$ = merge(
    inviteesAsOptions$.pipe(takeUntil(onSelect$)),
    onSelect$
  ).pipe(tag("selectedOptions$"), shareReplay())

  const options$ = contacts$.pipe(
    map(contactsToOptions),
    tag("options$"),
    shareReplay()
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
  //   shareReplay()
  // )

  const invitees$ = selectedOptions$.pipe(
    map(optionsToInvitees),
    tag("invitees$"),
    shareReplay()
  )

  const recordNote$ = record$.pipe(
    pluck("note"),
    tag("recordNote$"),
    shareReplay()
  )
  const { $: _onChangeNote$, cb: onChangeNote } =
    makeObservableCallback<string>()
  const onChangeNote$ = _onChangeNote$.pipe(tag("onChangeNote$"), shareReplay())

  const note$ = merge(
    recordNote$.pipe(takeUntil(onChangeNote$)),
    onChangeNote$
  ).pipe(distinctUntilChanged(), tag("note$"), shareReplay())

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
  ).pipe(startWith(false), tag("isSyncing$"), shareReplay())

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
  // TODO: analtyics
  // TODO: cleanup emptied

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

  const react = combineLatest({
    options: options$,
    selectedOptions: selectedOptions$,
    isSyncing: isSyncing$,
    note: note$,
    isDeleting: isDeleting$,
    isDeleteDisabled: isDeleteDisabled$,
  }).pipe(
    tag("combineLatest"),
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
