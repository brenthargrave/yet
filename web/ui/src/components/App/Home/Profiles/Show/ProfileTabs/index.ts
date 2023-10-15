import {
  Divider,
  Spacer,
  Stack,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  TabsProps,
  Text,
} from "@chakra-ui/react"
import { h } from "@cycle/react"
import { FC } from "react"
import { TimelineEventList } from "~/components/TimelineEvent"
import { isEmpty, isNotLastItem } from "~/fp"
import {
  Contact,
  Conversation,
  Customer,
  ProfileExtended,
  TimelineEvent,
} from "~/graph"
import { ariaLabel, FullWidthList, FullWidthVStack } from "~/system"
import { EmptyView as TimelineEmptyView } from "../../../Timeline/EmptyView"
import { ShareButton } from "../ShareButton"
import { ContactsEmptyView } from "./ContactsEmptyView"
import { ContactView } from "./ContactView"

export enum ProfileTab {
  Activity = 0,
  Contacts,
}

export interface ProfileListsProps {
  events: TimelineEvent[]
  contacts: Contact[]
}

export interface Props extends ProfileListsProps {
  viewer: Customer
  subject: ProfileExtended
  onClickConversation?: (c: Conversation) => void
  onClickNewConversation?: () => void
  defaultTab?: ProfileTab
  onClickShareContacts?: () => void
}

export const ProfileTabsView: FC<Props> = ({
  viewer,
  subject,
  events,
  contacts,
  onClickConversation,
  onClickNewConversation,
  defaultTab = ProfileTab.Activity,
  onClickShareContacts,
}) => {
  const tabsProps: Omit<TabsProps, "children"> = {
    defaultIndex: defaultTab,
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
  }

  return h(
    FullWidthVStack,
    {
      //
    },
    [
      h(Tabs, { ...tabsProps }, [
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
                    h(
                      Stack,
                      { direction: "row", width: "100%", pt: 4, pb: 0 },
                      [
                        //
                        h(Text, { as: "i" }, "By conversations"),
                        h(Spacer),
                        h(ShareButton, {
                          variant: "outline",
                          onClick: onClickShareContacts,
                        }),
                      ]
                    ),
                    h(FullWidthList, { spacing: 4 }, [
                      ...(contacts ?? []).map((contact, idx, all) =>
                        h(FullWidthVStack, { pt: 4 }, [
                          h(ContactView, { viewer, contact }),
                          isNotLastItem(idx, all) &&
                            // TODO: refactor w/ ConversationDivider
                            h(Divider, { pt: 4, pb: 0 }),
                        ])
                      ),
                    ]),
                  ]),
            ]
          ),
        ]),
      ]),
    ]
  )
}
