import { Maybe, Opp } from "../generated"
import { reject, isEmpty, join } from "~/fp"
import { routeURL } from "~/router"

export const isValidName = (value: string) => value.length > 2
export const isValidOrg = isValidName
export const isValidRole = isValidName

const bold = (s: string) => `**${s}**`

// TODO: pending dedicated Opps profile pages
// routeURL(routes.opp({ id })),
const localURL = ({ id, url }: Opp) => url

const mkLink = (opp: Opp): string =>
  `[${opp.role} @ ${opp.org}](${localURL(opp)})`

export const appendToNote = ({
  note,
  opp,
}: {
  opp: Opp
  note: string | null | undefined
}) => {
  const parts = reject(isEmpty, [note, mkLink(opp)])
  const result = join("\n\n", parts)
  return result
}
