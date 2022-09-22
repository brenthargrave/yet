import { SmallAddIcon } from "@chakra-ui/icons"
import { Heading, HStack, IconButton, ListItem, Spacer } from "@chakra-ui/react"
import { h } from "@cycle/react"
import { FC } from "react"
import { OnClickPay, OppView } from "~/components/Opp"
import { isEmpty } from "~/fp"
import { Customer, Maybe, Opp, oppAriaLabel } from "~/graph"
import {
  AriaHeading,
  ariaLabel,
  containerProps,
  CreateButton,
  Divider,
  FullWidthList,
  FullWidthVStack,
  Header,
  Nav,
  Stack,
} from "~/system"
import { Location } from ".."
import { EmptyView, OnClickNew } from "./EmptyView"

const isNotLastItem = <T>(idx: number, all: T[]) => !(idx + 1 === all.length)

const isModal = (location: Location) => location === Location.modal

export interface Props {
  location: Location
  viewer: Maybe<Customer>
  onClickNew?: OnClickNew
  opps: Opp[]
  onClickAdd?: (opp: Opp) => void
  onClickOpp?: (opp: Opp) => void
  onClickPay?: OnClickPay
}

export const View: FC<Props> = ({
  location,
  viewer,
  onClickNew,
  opps = [],
  onClickAdd = () => null,
  onClickOpp = () => null,
  onClickPay: _onClickPay,
}) =>
  isEmpty(opps)
    ? h(EmptyView, { ...containerProps, onClickNew })
    : h(FullWidthVStack, { ...containerProps }, [
        h(Nav),
        h(Header, {}, [
          h(AriaHeading, { size: "md" }, "Your Opportunities"),
          h(Spacer),
          h(CreateButton, { onClick: onClickNew, cta: `New opp` }),
        ]),
        h(FullWidthList, [
          ...opps.map((opp, idx, all) => {
            const onClickPay = (opp: Opp) => {
              if (_onClickPay) _onClickPay(opp)
            }
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
                        ...ariaLabel(`Add ${oppAriaLabel(opp)}`),
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
                        onClickOpp(opp)
                      },
                    },
                    [
                      //
                      h(OppView, {
                        location,
                        opp,
                        viewer,
                        onClickPay,
                      }),
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
