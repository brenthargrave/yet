import {
  Icon,
  IconButton,
  VStack,
  Stack,
  Spacer,
  Divider,
  HStack,
} from "@chakra-ui/react"
import { h } from "@cycle/react"
import { FC } from "react"
import { TbArrowsSplit2 } from "react-icons/tb"

// NOTE: make sure gutterWidth is wider than menu
const gutterWidth = "48px"
const ColumnNav: FC = ({ children }) =>
  h(Stack, { width: "100%", direction: "row" }, [
    h(VStack, { minWidth: gutterWidth }, [
      h(HStack, { minWidth: gutterWidth, paddingTop: "100px" }, [
        // Menu
        h(Divider, { orientation: "vertical" }),
      ]),
      // h(Button, {
      //   variant: "outline",
      //   leftIcon: h(Icon, { as: TbArrowsSplit2 }),
      // })
    ]),
    children,
    h(VStack, { minWidth: gutterWidth }, [
      //
      h(Spacer),
    ]),
  ])

interface Props {}
export const View: FC<Props> = ({ children }) =>
  h(Stack, { direction: "column", width: "100%" }, [
    h(HStack, {}, [
      h(IconButton, {
        icon: h(Icon, { as: TbArrowsSplit2 }),
        size: "lg",
        variant: "outline",
        // variant: "ghost",
      }),
    ]),
    children,
  ])
