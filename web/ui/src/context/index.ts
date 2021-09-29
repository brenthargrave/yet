import { Subject } from "rxjs"
import { Client, client } from "~/graph"

export interface Context {
  client: Client
  errors$: Subject<readonly Error[]>
}

const errors$ = new Subject<readonly Error[]>()

export const context = {
  client,
  errors$,
}
