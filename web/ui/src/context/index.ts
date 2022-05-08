import { Subject } from "rxjs"
import { Client, client } from "~/graph"
import { toast, ToastProps } from "~/toast"

export interface Context {
  client: Client
  errors$: Subject<readonly Error[]>
  toast: (props: ToastProps) => void
}

const errors$ = new Subject<readonly Error[]>()

export const context = {
  client,
  errors$,
}
