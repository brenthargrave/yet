import { SmallAddIcon } from "@chakra-ui/icons"
import {
  Heading,
  HStack,
  IconButton,
  List,
  ListItem,
  Spacer,
} from "@chakra-ui/react"
import { h } from "@cycle/react"
import { FC } from "react"
import { OppView } from "~/components/Opp"
import { isEmpty } from "~/fp"
import { Opp } from "~/graph"
import { CreateButton, Divider, Header, modalStyleProps, Stack } from "~/system"
import { Location } from ".."
import { EmptyOppsView, OnClickNew } from "./EmptyView"

// TODO: minHeight varies by render target (home vs. modal)
const { minHeight } = modalStyleProps

const isNotLastItem = <T>(idx: number, all: T[]) => !(idx + 1 === all.length)

const isModal = (location: Location) => location === Location.modal

export interface Props {
  location: Location
  onClickCreate?: OnClickNew
  opps: Opp[]
  // viewer: Maybe<Customer>
  onClickAdd?: (opp: Opp) => void
  onClickOpp?: (opp: Opp) => void
}

export const View: FC<Props> = ({
  location,
  onClickCreate,
  opps = [],
  onClickAdd = () => null,
  onClickOpp = () => null,
  // viewer,
}) =>
  isEmpty(opps)
    ? h(EmptyOppsView, { minHeight, onClickCreate })
    : h(Stack, { minHeight, direction: "column" }, [
        h(Header, {}, [
          h(Heading, { size: "md" }, "Opportunities"),
          h(Spacer),
          h(CreateButton, { onClick: onClickCreate, cta: `New opp` }),
        ]),
        h(List, { spacing: 4, paddingTop: 4 }, [
          ...opps.map((opp, idx, all) => {
            return h(ListItem, {}, [
              h(
                Stack,
                {
                  direction: "row",
                  alignItems: "center",
                  gap: 3,
                },
                [
                  isModal(location) &&
                    h(HStack, [
                      h(IconButton, {
                        icon: h(SmallAddIcon),
                        variant: "ghost",
                        size: "lg",
                        onClick: () => onClickAdd(opp),
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
                      onClick: () => onClickOpp(opp),
                    },
                    [
                      //
                      h(OppView, { opp }),
                    ]
                  ),
                ]
              ),
              // TODO: redesign divider, right margin
              isNotLastItem(idx, all) &&
                h(Divider, { padding: 2, width: "100%" }),
            ])
          }),
        ]),
      ])

View.displayName = "Opps.List"
