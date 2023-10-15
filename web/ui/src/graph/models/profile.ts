import { ReactNode } from "react"
import {
  FaFacebook,
  FaGithub,
  FaLink,
  FaLinkedin,
  FaTwitter,
} from "react-icons/fa"
import { match, P } from "ts-pattern"
import { isNotEmpty } from "~/fp"
import {
  AuthProvider,
  Profile,
  ProfileExtended,
  SocialSite,
} from "../generated"

export const socialLowered = (social: AuthProvider) => social.toLowerCase()

export const hasSocial = (social: AuthProvider, profile: ProfileExtended) =>
  match(social)
    .with(AuthProvider.Twitter, () => isNotEmpty(profile.twitterHandle))
    .with(AuthProvider.Facebook, () => isNotEmpty(profile.facebookUrl))
    .exhaustive()

export const hrefForSocial = (
  social: AuthProvider,
  profile: ProfileExtended
): string =>
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
  profile: Profile | ProfileExtended
): string =>
  match(social)
    .with(AuthProvider.Twitter, () => `@${profile.twitterHandle}`)
    .with(AuthProvider.Facebook, () => profile.facebookName || profile.name)
    .exhaustive()

export const formatWebsite = (url: string) =>
  new URL(url).host.replace("www.", "")

enum Domain {
  Github = "github.com",
}

// UI helpers
const getSite = (urlString: string): SocialSite => {
  const domain = new URL(urlString).hostname.replace("www.", "")
  return match(domain)
    .with("twitter.com", () => SocialSite.Twitter)
    .with("linkedin.com", () => SocialSite.Linkedin)
    .with("facebook.com", () => SocialSite.Facebook)
    .with("github.com", () => SocialSite.Github)
    .otherwise(() => SocialSite.Website)
}

export const iconForSocial = (socialURL: string) =>
  match(getSite(socialURL))
    .with(SocialSite.Twitter, () => FaTwitter)
    .with(SocialSite.Facebook, () => FaFacebook)
    .with(SocialSite.Linkedin, () => FaLinkedin)
    .with(SocialSite.Github, () => FaGithub)
    .with(SocialSite.Website, () => FaLink)
    .exhaustive()
