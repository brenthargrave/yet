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
import { createRef, FC, useLayoutEffect, useRef, useState } from "react"
import { TbArrowsSplit2, TbNotes } from "react-icons/tb"

const ref = createRef<HTMLElement>()

export const isFrom = (event: React.MouseEvent<HTMLElement>) => {
  const rect = ref.current?.getBoundingClientRect()
  if (!rect) return false
  const x = event.clientX
  const y = event.clientY
  const result =
    x > rect.left && x < rect.right && y > rect.top && y < rect.bottom
  return result
}

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
  const buttonRefConvos = useRef<HTMLButtonElement>()
  const onClickConvosButton = (e: React.MouseEvent<HTMLButtonElement>) => {
    onClickConversations()
    buttonRefConvos.current?.blur()
  }
  const buttonRefOpps = useRef<HTMLButtonElement>()
  const onClickOppsButton = (e: React.MouseEvent<HTMLButtonElement>) => {
    onClickOpps()
    buttonRefOpps.current?.blur()
  }
  const onClickOutside = (e: React.MouseEvent) => e.stopPropagation()

  return h(Stack, { direction: "column", width: "100%", height: "100%" }, [
    h(
      Stack,
      {
        ref,
        sx: {
          position: "fixed",
          left,
          bottom: 0,
          zIndex: 2,
        },
        direction: "row",
        alignItems: "center",
        padding: 4,
        marginBottom: 4,
        backgroundColor: "white",
        borderRadius: "lg",
        onClick: onClickOutside,
      },
      [
        h(HStack, {}, [
          h(ButtonGroup, { isAttached: false }, [
            h(IconButton, {
              icon: h(Icon, { as: TbNotes }),
              size: "lg",
              variant: "outline",
              ref: buttonRefConvos,
              onClick: onClickConvosButton,
            }),
            h(IconButton, {
              icon: h(Icon, { as: TbArrowsSplit2 }),
              size: "lg",
              variant: "outline",
              color: "green.600",
              ref: buttonRefOpps,
              onClick: onClickOppsButton,
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
