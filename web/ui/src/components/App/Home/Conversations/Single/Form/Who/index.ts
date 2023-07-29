import { h, ReactSource } from "@cycle/react"
import {
  combineLatest,
  distinctUntilChanged,
  map,
  merge,
  mergeMap,
  Observable,
  pluck,
  skip,
  withLatestFrom,
} from "rxjs"
import { Source as ActionSource } from "~/action"
import { includes, pluck as _pluck } from "~/fp"
import {
  Contact,
  ConversationProp,
  DraftConversation,
  EventName,
  Invitee,
  inviteesDiffer,
  Profile,
  Source as GraphSource,
  track$,
} from "~/graph"
import { makeTagger } from "~/log"
import { Source as RouterSource } from "~/router"
import { cb$, shareLatest } from "~/rx"
import { Option as ContactOption, SelectedOption, View } from "./View"

const contactsToOptions = (contacts: Contact[]): SelectedOption[] =>
  contacts.map(({ id, name }, idx, _) => {
    return { label: name, value: id }
  })

const inviteesToOptions = (invitees: Invitee[]): SelectedOption[] =>
  invitees.map(({ id, name }, idx, _) => {
    return { label: name, value: id }
  })

const optionsToInvitees = (
  options: ContactOption[],
  contacts: Profile[]
): Invitee[] => {
  const contactIds = _pluck("id", contacts)
  return options.map(({ label: name, value: id }) => {
    const isContact = includes(id, contactIds)
    return { name, id, isContact } as Invitee
  })
}

interface Sources {
  react: ReactSource
  router: RouterSource
  graph: GraphSource
  action: ActionSource
  props: {
    record$: Observable<DraftConversation>
    isDisabled$: Observable<boolean>
  }
}

export const Who = (sources: Sources, _tagPrefix: string) => {
  const tagPrefix = `${_tagPrefix}/Who`
  const tag = makeTagger(tagPrefix)

  const {
    graph: { contacts$, me$ },
    props: { record$: _record$, isDisabled$ },
  } = sources

  const record$ = _record$.pipe(tag("record$"), shareLatest())

  const recordInvitees$ = record$.pipe(pluck("invitees"))
  const recordInviteesAsOptions$ = recordInvitees$.pipe(
    map(inviteesToOptions),
    tag("recordInviteesAsOptions$"),
    shareLatest()
  )

  const [onSelect, onSelect$] = cb$<ContactOption[]>(tag("onSelect$"))

  const selectedOptions$ = merge(recordInviteesAsOptions$, onSelect$).pipe(
    tag("selectedOptions$"),
    shareLatest()
  )

  const options$ = contacts$.pipe(
    map(contactsToOptions),
    tag("options$"),
    shareLatest()
  )

  const invitees$ = combineLatest({
    options: selectedOptions$,
    contacts: contacts$,
  }).pipe(
    // @ts-ignore
    map(({ options, contacts }) => optionsToInvitees(options, contacts)),
    distinctUntilChanged(inviteesDiffer),
    tag("invitees$"),
    shareLatest()
  )

  const props$ = combineLatest({
    options: options$,
    selectedOptions: selectedOptions$,
    isDisabled: isDisabled$,
  }).pipe(tag("props$"))

  const react = props$.pipe(
    map((props) =>
      h(View, {
        ...props,
        onSelect,
      })
    ),
    tag("react")
  )

  const track = invitees$.pipe(
    skip(1), // skip initial event of prior invitees
    withLatestFrom(record$, me$),
    mergeMap(([invitees, record, me]) =>
      track$({
        customerId: me?.id,
        name: EventName.UpdateConversation,
        properties: {
          conversationProp: ConversationProp.Invitees,
          conversationId: record.id,
        },
      })
    ),
    tag("track")
  )

  const value = { onSelect$, invitees$ }

  return {
    react,
    track,
    value,
  }
}
