import { camelCase } from "change-case"
import { first } from "remeda"
import { isNotNullish } from "rxjs-etc"
import { find, isNil, none, not, propSatisfies } from "~/fp"
import { Customer, Maybe, ProfileProp } from ".."

export const isAuthenticated = (me: Maybe<Customer>) => isNotNullish(me)

export const isLurking = (me: Maybe<Customer>) => not(isAuthenticated(me))

export const requiredProfileProps = [
  ProfileProp.FirstName,
  ProfileProp.LastName,
  ProfileProp.Email,
  // TODO: restore once org impl. improved
  // ProfileProp.Org,
  // ProfileProp.Role,
]

export const hasAllRequiredProfileProps = (me: Customer) =>
  none(
    (prop) => propSatisfies(isNil, camelCase(prop), me),
    Object.values(requiredProfileProps)
  )

export const firstRequiredProfileProp = first(requiredProfileProps)

export const nextRequiredProfileProp = (me: Maybe<Customer>) =>
  find(
    (attr) => propSatisfies(isNil, camelCase(attr), me),
    requiredProfileProps
  )

export const isOnboard = (me: Maybe<Customer>) =>
  !!me && hasAllRequiredProfileProps(me)

export const isOnboarding = (me: Maybe<Customer>) => not(isOnboard(me))
