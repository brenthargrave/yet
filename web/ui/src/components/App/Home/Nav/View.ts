import {
  Icon,
  IconButton,
  VStack,
  Stack,
  Spacer,
  Divider,
  HStack,
  Box,
} from "@chakra-ui/react"
import { h } from "@cycle/react"
import { borderColor } from "csx"
import { FC, useEffect, useLayoutEffect, useRef, useState } from "react"
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

export const View: FC<Props> = ({ children }) => {
  const ref = useRef<HTMLElement>()
  const [left, setLeft] = useState(0)
  const [menuH, setMenuH] = useState(0)
  useLayoutEffect(() => {
    const clientWidth =
      window.innerWidth ||
      document.documentElement.clientWidth ||
      document.body.clientWidth
    console.debug("client", clientWidth)
    const w = ref.current?.offsetWidth
    const h = ref.current?.offsetHeight
    if (h) setMenuH(h)
    console.debug("menu", clientWidth)
    if (w && clientWidth) {
      const calc = clientWidth * 0.5 - w * 0.5
      console.debug("calc", calc)
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
          // filter: "blur(2px)",
        },
        direction: "row",
        alignItems: "center",
        padding: 4,
        marginBottom: 4,
        backgroundColor: "white",
        borderRadius: "full",
        borderColor: "darkGray",
        border: "2px",
      },
      [
        h(
          HStack,
          {
            sx: {
              // backdropFilter: "blur(5px)",
            },
          },
          [
            h(IconButton, {
              icon: h(Icon, { as: TbArrowsSplit2 }),
              size: "lg",
              variant: "outline",
              // variant: "ghost",
            }),
            h(IconButton, {
              icon: h(Icon, { as: TbArrowsSplit2 }),
              size: "lg",
              variant: "outline",
              // variant: "ghost",
            }),
          ]
        ),
      ]
    ),
    children,
    // NOTE: need an empty footer to make room for nav
    h(Box, { width: "100%", minHeight: `${menuH}px` }, h(Spacer)),
  ])
}
