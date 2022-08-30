import { ID, Opp } from "~/graph"

export * from "./driver"

export enum Actions {
  listOpps = "listOpps",
  createOpp = "createOpp",
  showOpp = "showOpp",
  editOpp = "editOpp",
  editProfile = "editProfile",
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

interface EditProfile {
  type: Actions.editProfile
  id?: ID
}

export type Action = ListOpps | CreateOpp | ShowOpp | EditOpp | EditProfile

export const act = (type: Actions, args?: Omit<Action, "type">): Action =>
  ({
    type,
    ...args,
  } as Action)
