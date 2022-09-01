import { ID, Opp } from "~/graph"

export * from "./driver"

export enum Actions {
  listOpps = "listOpps",
  createOpp = "createOpp",
  showOpp = "showOpp",
  editOpp = "editOpp",
  editProfile = "editProfile",
  showProfile = "showProfile",
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

interface ShowProfile {
  type: Actions.showProfile
  id?: ID
}

export type Action =
  | ListOpps
  | CreateOpp
  | ShowOpp
  | EditOpp
  | EditProfile
  | ShowProfile

export const act = (type: Actions, args?: Omit<Action, "type">): Action =>
  ({
    type,
    ...args,
  } as Action)
