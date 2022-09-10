import { ulid } from "ulid"
import { routes, routeURL } from "~/router"
import { Currency, Customer, Maybe, Opp } from "../generated"

export const isValidName = (value: string) => value.length > 2
export const isValidOrg = isValidName
export const isValidRole = isValidName

export const oppUrl = (opp: Opp) => routeURL(routes.opp({ oid: opp.id }))

export const oppEmbedText = (opp: Opp) => {
  const { id, role, org } = opp
  const url = oppUrl(opp)
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

export const isOwnedBy = (opp: Opp, customer: Maybe<Customer>) =>
  opp.owner.id === customer?.id

export const oppAriaLabel = (opp: Opp) => `${opp.role} @ ${opp.org}`
