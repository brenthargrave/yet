import {
  Box,
  ButtonGroup,
  Divider,
  HStack,
  Icon,
  IconButton,
  Spacer,
  Stack,
  VStack,
} from "@chakra-ui/react"
import { h } from "@cycle/react"
import { FC, useLayoutEffect, useRef, useState } from "react"
import { TbArrowsSplit2, TbNotes } from "react-icons/tb"

export interface Props {
  isVisible?: boolean
  onClickConversations: () => void
  onClickOpps: () => void
}

export const View: FC<Props> = ({
  children,
  onClickConversations,
  onClickOpps,
}) => {
  const ref = useRef<HTMLElement>()
  const [left, setLeft] = useState(0)
  const [footerH, setFooterH] = useState(0)
  useLayoutEffect(() => {
    const clientWidth =
      window.innerWidth ||
      document.documentElement.clientWidth ||
      document.body.clientWidth
    const w = ref.current?.offsetWidth
    const h = ref.current?.offsetHeight
    if (h) setFooterH(h)
    if (w && clientWidth) {
      const calc = clientWidth * 0.5 - w * 0.5
      setLeft(calc)
    }
  })

  return h(Stack, { direction: "column", width: "100%", height: "100%" }, [
    h(
      Stack,
      {
        ref,
        sx: {
          position: "fixed",
          left,
          bottom: 0,
        },
        direction: "row",
        alignItems: "center",
        padding: 4,
        marginBottom: 4,
        backgroundColor: "white",
        borderRadius: "lg",
      },
      [
        h(HStack, {}, [
          h(ButtonGroup, { isAttached: false }, [
            h(IconButton, {
              icon: h(Icon, { as: TbNotes }),
              size: "lg",
              variant: "outline",
              onClick: onClickConversations,
            }),
            h(IconButton, {
              icon: h(Icon, { as: TbArrowsSplit2 }),
              size: "lg",
              variant: "outline",
              color: "green.600",
              onClick: onClickOpps,
            }),
          ]),
        ]),
      ]
    ),
    children,
    // NOTE: need an empty footer to make room for nav
    h(Box, { width: "100%", minHeight: `${footerH}px` }, [
      //
      h(Spacer),
    ]),
  ])
}

View.displayName = "NavView"

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