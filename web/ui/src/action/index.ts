import { Opp } from "~/graph"

export * from "./driver"

export enum Actions {
  listOpps = "listOpps",
  createOpp = "createOpp",
  showOpp = "showOpp",
  editOpp = "editOpp",
}

interface ListOpps {
  type: Actions.listOpps
}

interface CreateOpp {
  type: Actions.createOpp
}

interface ShowOpp {
  type: Actions.showOpp
  opp: Opp
}

interface EditOpp {
  type: Actions.editOpp
  opp: Opp
}

export type Action = ListOpps | CreateOpp | ShowOpp | EditOpp

export const act = (type: Actions, args?: Omit<Action, "type">): Action =>
  ({
    type,
    ...args,
  } as Action)
