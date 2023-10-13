import { Tab, TabList, TabPanel, TabPanels, Tabs, Text } from "@chakra-ui/react"
import { h } from "@cycle/react"
import { FC } from "react"
import { TimelineEventList } from "~/components/TimelineEvent"
import { isEmpty } from "~/fp"
import {
  Contact,
  Conversation,
  Customer,
  ProfileExtended,
  TimelineEvent,
} from "~/graph"
import { ariaLabel, FullWidthList, FullWidthVStack } from "~/system"
import { EmptyView as TimelineEmptyView } from "../../../Timeline/EmptyView"
import { ContactsEmptyView } from "./ContactsEmptyView"
import { ContactView } from "./ContactView"

export interface ProfileListsProps {
  events: TimelineEvent[]
  contacts: Contact[]
}

export interface Props extends ProfileListsProps {
  viewer: Customer
  subject: ProfileExtended
  onClickConversation?: (c: Conversation) => void
  onClickNewConversation?: () => void
}

export const ProfileTabs: FC<Props> = ({
  viewer,
  subject,
  events,
  contacts,
  onClickConversation,
  onClickNewConversation,
}) => {
  return h(
    FullWidthVStack,
    {
      //
    },
    [
      h(
        Tabs,
        {
          isFitted: true,
          // variant: "unstyled",
          variant: "line",
          // variant: "enclosed",
          // variant: "enclosed-colored",
          // variant: "soft-rounded",
          // variant: "solid-rounded",

          // isLazy: true,
          // minHeight: px(minHeight ?? 0).toString(),
          width: "100%",
          // isManual: true,
          colorScheme: "gray",
        },
        [
          h(TabList, {}, [
            //
            h(Tab, { ...ariaLabel("Activity") }, `Activity`),
            h(Tab, { ...ariaLabel("Contacts") }, `Contacts`),
          ]),
          h(TabPanels, {}, [
            // Activity
            h(
              TabPanel,
              {
                pl: 0,
                pr: 0,
              },
              [
                isEmpty(events)
                  ? h(TimelineEmptyView, { onClickNew: onClickNewConversation })
                  : h(TimelineEventList, {
                      viewer,
                      events,
                      onClickConversation,
                    }),
              ]
            ),
            // Contacts
            h(
              TabPanel,
              {
                //
                pl: 0,
                pr: 0,
              },
              [
                isEmpty(contacts)
                  ? h(ContactsEmptyView, {
                      viewer,
                      subject,
                      onClickNew: onClickNewConversation,
                    })
                  : h(FullWidthVStack, {}, [
                      h(Text, { as: "i", pt: 4, pb: 2 }, "By conversations"),
                      h(FullWidthList, {}, [
                        ...(contacts ?? []).map((contact, idx) =>
                          h(ContactView, { viewer, contact })
                        ),
                      ]),
                    ]),
              ]
            ),
          ]),
        ]
      ),
    ]
  )
}
