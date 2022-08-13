import { isEmpty, join, reject } from "~/fp"
import { routes, routeURL } from "~/router"
import { Opp } from "../generated"

export const isValidName = (value: string) => value.length > 2
export const isValidOrg = isValidName
export const isValidRole = isValidName

const localURL = ({ id }: Opp) => routeURL(routes.opp({ id }))

export const appendToNote = ({
  note,
  opp,
}: {
  opp: Opp
  note: string | null | undefined
}) => {
  const parts = reject(isEmpty, [note, localURL(opp)])
  const result = join("\n\n", parts)
  return result
}
