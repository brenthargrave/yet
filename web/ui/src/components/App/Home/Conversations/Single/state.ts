import { Observable } from "rxjs"
import { Conversation, ID } from "~/graph"

export enum StateName {
  create = "create",
  edit = "edit",
  sign = "sign",
  show = "show",
}

interface Base {
  id$: Observable<ID>
  record$: Observable<Conversation>
  liveRecord$: Observable<Conversation>
}

export interface Create extends Base {
  name: StateName.create
}

export interface Edit extends Base {
  name: StateName.edit
}

export interface Show extends Base {
  name: StateName.
}


export type State = Create | Edit
