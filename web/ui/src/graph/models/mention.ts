import { pipe, reverse, sortBy, values } from "remeda"
import { Mention, Profile } from "~/graph"
import { ariaLabel } from "~/system"
import { Customer } from "../generated"

// TODO: replace Contact w/ Profile everywhere
export interface Mentioner {
  profile: Profile
  mentionCount: number
}

type Target = Record<string, Mentioner>

const process = (target: Target, p: Profile, me: Customer) => {
  const { id } = p
  const existing: Mentioner = target[id]
  if (me && me.id === id) {
    // no-op
  } else if (existing) {
    // eslint-disable-next-line no-plusplus
    existing.mentionCount++
  } else {
    // eslint-disable-next-line no-param-reassign
    target[p.id] = {
      profile: p,
      mentionCount: 1,
    }
  }
}

export const mentionersFrom = (mentions: Mention[], me: Customer) =>
  pipe(
    mentions.reduce((target, mention, _idx) => {
      const {
        conversation: { participations, creator },
      } = mention
      process(target, creator, me)
      participations.forEach(({ participant }) => {
        process(target, participant, me)
      })
      return target
    }, {}),
    values,
    sortBy((m: Mentioner) => m.mentionCount),
    reverse
  )

export const ariaLabelProfile = (profile: Profile) => ariaLabel(profile.name)
