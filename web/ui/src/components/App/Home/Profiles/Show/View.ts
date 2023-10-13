import { LinkIcon } from "@chakra-ui/icons"
import {
  Button,
  Heading,
  HStack,
  Icon,
  IconButton,
  Link,
  Spacer,
  Stack,
  StackDivider,
  Text,
} from "@chakra-ui/react"
import { h } from "@cycle/react"
import { FC, ReactNode } from "react"
import { GrLocation } from "react-icons/gr"
import { HiOutlineOfficeBuilding } from "react-icons/hi"
import {
  AuthProvider,
  Conversation,
  Customer,
  formatWebsite,
  hasSocial,
  iconForSocial,
  ProfileExtended,
} from "~/graph"
import { t } from "~/i18n"
import {
  AriaHeading,
  containerProps,
  EditButton,
  FullWidthVStack,
  Header,
  MarkdownView,
  Nav,
} from "~/system"
import { View as MuteButton } from "./MuteButton/View"
import {
  ProfileListsProps,
  ProfileTabs,
  Props as ProfileTabsProps,
} from "./ProfileTabs"

export enum State {
  loading = "loading",
  ready = "ready",
}

export interface Props extends ProfileListsProps {
  profile: ProfileExtended
  state: State
  viewer: Customer
  onClickEdit?: () => void
  onClickConversation?: (c: Conversation) => void
  onClickNewConversation?: () => void
  onClickSocial?: (social: AuthProvider) => void
  //
  muteButton?: ReactNode
}

export const View: FC<Props> = ({
  state,
  viewer,
  profile,
  events,
  contacts,
  onClickEdit,
  onClickConversation,
  onClickNewConversation,
  onClickSocial,
  //
  muteButton,
}) => {
  const {
    socialDistance,
    name,
    email,
    e164,
    phone,
    role,
    org,
    location,
    website,
  } = profile
  const isOwn = viewer.id === profile.id
  const relation = isOwn ? "me" : "other"

  const socials = Object.values(AuthProvider).filter((social) =>
    hasSocial(social, profile)
  )

  const profileTabsProps: ProfileTabsProps = {
    viewer,
    subject: profile,
    events,
    contacts,
    onClickConversation,
    onClickNewConversation,
  }

  return state === State.loading
    ? null
    : h(FullWidthVStack, { ...containerProps }, [
        h(Nav),
        h(Header, {}, [
          //
          h(AriaHeading, { size: "md" }, t(`profles.show.${relation}.heading`)),
          h(Spacer),
        ]),
        h(
          FullWidthVStack,
          {
            //
            gap: 6,
            isBody: true,
            // divider: h(StackDivider, { borderColor: "gray.200" }),
          },
          [
            h(FullWidthVStack, { gap: 2 }, [
              h(FullWidthVStack, {}, [
                h(Stack, { direction: "row", width: "100%", align: "center" }, [
                  // Name
                  h(Heading, { size: "lg" }, name),
                  h(Spacer),
                  isOwn
                    ? h(EditButton, {
                        onClick: () => {
                          if (onClickEdit) onClickEdit()
                        },
                      })
                    : muteButton,
                ]),
                // Work
                role &&
                  org &&
                  //
                  h(HStack, {}, [
                    h(Icon, { as: HiOutlineOfficeBuilding }),
                    h(MarkdownView, { md: `**${role}** at **${org}**` }),
                  ]),
              ]),

              // TODO: contact info
              // email &&
              //   h(HStack, {}, [
              //     h(EmailIcon, { size: "sm" }),
              //     h(Text, { fontSize: "sm" }, [
              //       a({ href: `mailto:${email}` }, email),
              //     ]),
              //   ]),
              // (isOwn || isContact) &&
              //   phone &&
              //   h(HStack, {}, [
              //     h(PhoneIcon, { size: "sm" }),
              //     h(Text, { fontSize: "sm" }, [
              //       // TODO: change icon, link format to preferred channel
              //       // sms: MdOutlineTextsms
              //       // signal: BsSignal
              //       // telegram: BsTelegram
              //       // whatsapp: BsWhatsapp
              //       a({ href: `tel:${e164}` }, phone),
              //     ]),
              //   ]),

              // Socials, website, location
              h(HStack, { divider: h(StackDivider), gap: 1 }, [
                h(HStack, {}, [
                  ...socials.map((social) =>
                    h(IconButton, {
                      icon: h(iconForSocial(social)),
                      size: "xs",
                      colorScheme: social.toLowerCase(),
                      variant: "outline",
                      borderColor: "gray.200",
                      onClick: () => {
                        if (onClickSocial) onClickSocial(social)
                      },
                    })
                  ),
                ]),
                website &&
                  h(HStack, {}, [
                    h(LinkIcon, { boxSize: 3 }),
                    h(
                      Link,
                      {
                        //
                        fontSize: "sm",
                        href: website,
                        target: "_blank",
                      },
                      formatWebsite(website)
                    ),
                  ]),
                location &&
                  h(HStack, {}, [
                    //
                    h(Icon, { as: GrLocation }),
                    h(Text, { fontSize: "sm" }, location),
                  ]),
              ]),
            ]),
            h(ProfileTabs, profileTabsProps),
          ]
        ),
      ])
}
