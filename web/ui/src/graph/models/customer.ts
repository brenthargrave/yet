import { isNotNullish } from "rxjs-etc"
import { isNil, none, not, propSatisfies, toLower } from "~/fp"
import { Customer, Maybe, ProfileProp } from ".."

export const isAuthenticated = (me: Maybe<Customer>) => isNotNullish(me)

export const isLurking = (me: Maybe<Customer>) => not(isAuthenticated(me))

export const requiredProps = [ProfileProp.Name, ProfileProp.Email]

export const isOnboard = (me: Maybe<Customer>) =>
  none(
    (prop) => propSatisfies(isNil, toLower(prop), me),
    Object.values(requiredProps)
  )

export const isOnboarding = (me: Maybe<Customer>) => not(isOnboard(me))
