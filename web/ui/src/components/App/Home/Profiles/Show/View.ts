import { Heading, Spacer, Stack } from "@chakra-ui/react"
import { h } from "@cycle/react"
import { FC, ReactNode } from "react"
import { AuthProvider, Conversation, Customer, ProfileExtended } from "~/graph"
import { t } from "~/i18n"
import {
  AriaHeading,
  containerProps,
  EditButton,
  FullWidthVStack,
  Header,
  Nav,
} from "~/system"
import { ProfileSummary } from "../ProfileSummary"
import {
  ProfileListsProps,
  ProfileTabsView,
  Props as ProfileTabsProps,
} from "./ProfileTabs"
import { ShareButton } from "./ShareButton"

export enum State {
  loading = "loading",
  ready = "ready",
}

export interface Props
  extends ProfileListsProps,
    Pick<ProfileTabsProps, "defaultTab"> {
  profile: ProfileExtended
  state: State
  viewer: Customer
  onClickEdit?: () => void
  onClickConversation?: (c: Conversation) => void
  onClickNewConversation?: () => void
  onClickSocial?: (social: AuthProvider) => void

  //
  muteButton?: ReactNode
  //
  onClickShareContacts?: () => void
  onClickShareProfile?: () => void
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
  defaultTab,
  //
  onClickShareContacts,
  onClickShareProfile,
}) => {
  const { name } = profile
  const isOwn = viewer.id === profile.id
  const relation = isOwn ? "me" : "other"

  const profileTabsProps: ProfileTabsProps = {
    viewer,
    subject: profile,
    events,
    contacts,
    onClickConversation,
    onClickNewConversation,
    defaultTab,
    onClickShareContacts,
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
                    ? h(Stack, { direction: "row" }, [
                        h(ShareButton, { onClick: onClickShareProfile }),
                        h(EditButton, {
                          onClick: () => {
                            if (onClickEdit) onClickEdit()
                          },
                        }),
                      ])
                    : muteButton,
                ]),
              ]),
              h(ProfileSummary, { profile }),
            ]),
            h(ProfileTabsView, profileTabsProps),
          ]
        ),
      ])
}
