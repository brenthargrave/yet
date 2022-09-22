import { SmallAddIcon } from "@chakra-ui/icons"
import { Heading, HStack, IconButton, ListItem, Spacer } from "@chakra-ui/react"
import { h } from "@cycle/react"
import { isEmpty } from "ramda"
import { FC } from "react"
import { isNotLastItem } from "~/fp"
import { ariaLabelProfile, Mentioner, Opp, oppSummary, Profile } from "~/graph"
import {
  containerProps,
  Divider,
  FullWidthList,
  FullWidthVStack,
  Header,
  MarkdownView,
  Nav,
  Stack,
  Text,
} from "~/system"

export interface Props {
  onClickBack?: () => void
  opp: Opp
  mentioners?: Mentioner[]
  onClickProfile?: (profile: Profile) => void
}

export const View: FC<Props> = ({
  onClickBack,
  opp,
  mentioners = [],
  onClickProfile: _onClickProfile,
  ...props
}) => {
  return h(FullWidthVStack, { ...containerProps }, [
    h(Nav, { onClickBack, backButtonText: "Back" }),
    h(Header, [
      //
      h(Heading, { size: "md" }, "Payment"),
      h(Spacer),
    ]),
    h(FullWidthVStack, { isBody: true }, [
      h(MarkdownView, {
        md: `Select a payee to reward for:
         **${oppSummary(opp)}**`,
      }),

      h(Divider),

      // TODO: dedupe w/ Opps.List
      isEmpty(mentioners)
        ? h(Text, `Nobody has discussed this opp yet.`)
        : h(FullWidthList, [
            ...mentioners.map((mentioner, idx, all) => {
              const { profile, mentionCount } = mentioner
              const onClickProfile = () => {
                if (_onClickProfile) _onClickProfile(profile)
              }
              return h(ListItem, {}, [
                h(
                  Stack,
                  {
                    direction: "row",
                    alignItems: "center",
                    gap: 3,
                    onClick: () => onClickProfile(),
                    ...ariaLabelProfile(profile),
                  },
                  [
                    h(HStack, [
                      h(IconButton, {
                        icon: h(SmallAddIcon),
                        variant: "ghost",
                        size: "lg",
                      }),
                      h(Divider, {
                        //
                        orientation: "vertical",
                        h: "40px",
                      }),
                    ]),
                    h(
                      Stack,
                      {
                        direction: "column",
                        alignItems: "start",
                        width: "100%",
                        style: { cursor: "pointer" },
                        onClick: (e: React.MouseEvent<HTMLElement>) => {
                          e.stopPropagation()
                          onClickProfile()
                        },
                      },
                      [
                        h(
                          Text,
                          { size: "md" },
                          `${profile.name} (${mentionCount} ${
                            mentionCount === 1 ? "discussion" : "discussions"
                          })`
                        ),
                      ]
                    ),
                  ]
                ),
                isNotLastItem(idx, all) &&
                  h(Divider, { padding: 2, width: "100%" }),
              ])
            }),
          ]),
    ]),
  ])
}
