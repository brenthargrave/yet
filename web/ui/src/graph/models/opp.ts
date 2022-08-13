import { routes, routeURL } from "~/router"
import { Opp } from "../generated"

export const isValidName = (value: string) => value.length > 2
export const isValidOrg = isValidName
export const isValidRole = isValidName

export const oppEmbedText = (opp: Opp) => {
  const { id, role, org } = opp
  const url = routeURL(routes.opp({ id }))
  return `\n${role} @ ${org} \n${url}\n`
}
