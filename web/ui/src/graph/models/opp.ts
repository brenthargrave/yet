import { ulid } from "ulid"
import { routes, routeURL } from "~/router"
import { Currency, Opp } from "../generated"

export const isValidName = (value: string) => value.length > 2
export const isValidOrg = isValidName
export const isValidRole = isValidName

export const oppEmbedText = (opp: Opp) => {
  const { id, role, org } = opp
  const url = routeURL(routes.opp({ id }))
  return `\n${role} @ ${org} \n${url}\n`
}

export const newOpp = () => ({
  id: ulid(),
  org: "",
  role: "",
  desc: null,
  fee: {
    amount: 0,
    currency: Currency.Usd,
  },
})
