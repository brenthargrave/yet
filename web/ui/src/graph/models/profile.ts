import { FaFacebook, FaTwitter } from "react-icons/fa"
import { match } from "ts-pattern"
import { isNotEmpty } from "~/fp"
import { AuthProvider, Profile } from "../generated"

export const socialLowered = (social: AuthProvider) => social.toLowerCase()

export const iconForSocial = (social: AuthProvider) =>
  match(social)
    .with(AuthProvider.Twitter, () => FaTwitter)
    .with(AuthProvider.Facebook, () => FaFacebook)
    .exhaustive()

export const hasSocial = (social: AuthProvider, profile: Profile) =>
  match(social)
    .with(AuthProvider.Twitter, () => isNotEmpty(profile.twitterHandle))
    .with(AuthProvider.Facebook, () => isNotEmpty(profile.facebookUrl))
    .exhaustive()

export const hrefForSocial = (social: AuthProvider, profile: Profile): string =>
  match(social)
    .with(
      AuthProvider.Twitter,
      () => `https://twitter.com/@${profile.twitterHandle}`
    )
    .with(
      AuthProvider.Facebook,
      () => profile.facebookUrl || "https://facebook.com"
    )
    .exhaustive()

export const socialProduct = (social: AuthProvider): string =>
  match(social)
    .with(AuthProvider.Twitter, () => "Twitter")
    .with(AuthProvider.Facebook, () => "Facebook")
    .exhaustive()

export const handleForSocial = (
  social: AuthProvider,
  profile: Profile
): string =>
  match(social)
    .with(AuthProvider.Twitter, () => `@${profile.twitterHandle}`)
    .with(AuthProvider.Facebook, () => profile.facebookName || profile.name)
    .exhaustive()

export const formatWebsite = (url: string) => new URL(url).host
