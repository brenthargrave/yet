import { LinkIcon } from "@chakra-ui/icons"
import {
  Heading,
  HStack,
  Icon,
  IconButton,
  Link,
  Spacer,
  StackDivider,
  Text,
} from "@chakra-ui/react"
import { h } from "@cycle/react"
import { FC } from "react"
import { GrLocation } from "react-icons/gr"
import { HiOutlineOfficeBuilding } from "react-icons/hi"
import {} from "remeda"
import { TimelineEventList } from "~/components/TimelineEvent"
import { isEmpty } from "~/fp"
import {
  AuthProvider,
  Conversation,
  Customer,
  formatWebsite,
  hasSocial,
  iconForSocial,
  Profile,
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
import { EmptyView } from "../../Timeline/EmptyView"

export enum State {
  loading = "loading",
  ready = "ready",
}

export interface Props {
  state: State
  viewer: Customer
  profile: Profile
  onClickEdit?: () => void
  onClickConversation?: (c: Conversation) => void
  onClickNewConversation?: () => void
  onClickSocial?: (social: AuthProvider) => void
}

export const View: FC<Props> = ({
  state,
  viewer,
  profile,
  onClickEdit,
  onClickConversation,
  onClickNewConversation,
  onClickSocial,
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
    events = [],
  } = profile
  const isOwn = socialDistance === 0
  const isContact = socialDistance === 1
  const relation = isOwn ? "me" : "other"

  const socials = Object.values(AuthProvider).filter((social) =>
    hasSocial(social, profile)
  )

  return state === State.loading
    ? null
    : h(FullWidthVStack, { ...containerProps }, [
        h(Nav),
        h(Header, {}, [
          //
          h(AriaHeading, { size: "md" }, t(`profles.show.${relation}.heading`)),
          h(Spacer),
          isOwn &&
            h(EditButton, {
              onClick: () => {
                if (onClickEdit) onClickEdit()
              },
            }),
        ]),
        h(
          FullWidthVStack,
          {
            //
            gap: 4,
            isBody: true,
            divider: h(StackDivider, { borderColor: "gray.200" }),
          },
          [
            h(FullWidthVStack, { gap: 2 }, [
              h(FullWidthVStack, {}, [
                // Name
                h(Heading, { size: "lg" }, name),
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
            isEmpty(events)
              ? h(EmptyView, { onClickNew: onClickNewConversation })
              : h(FullWidthVStack, [
                  h(Heading, { size: "sm" }, `Activity`),
                  h(TimelineEventList, { viewer, events, onClickConversation }),
                ]),
          ]
        ),
      ])
}
