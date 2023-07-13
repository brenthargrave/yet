import {
  Box,
  Divider,
  Hide,
  HStack,
  Show,
  Spacer,
  Stack,
  VStack,
} from "@chakra-ui/react"
import { h } from "@cycle/react"
import { createRef, FC, useLayoutEffect, useState } from "react"
import { MenuView, Orientation, Props as MenuProps } from "./MenuView"

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

export interface Props extends Omit<MenuProps, "orientation"> {
  showHomeOnly: boolean
}

export const View: FC<Props> = ({
  children,
  showHomeOnly,
  onClickConversations,
  onClickOpps,
  onClickHome,
  onClickProfile,
  onClickNew,
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

  const onClickOutside = (e: React.MouseEvent) => e.stopPropagation()

  const gutterWidth = { base: "0px", md: "100px" }

  return h(Stack, { direction: "column", width: "100%", height: "100%" }, [
    h(Stack, { width: "100%", direction: "row" }, [
      h(VStack, { minWidth: gutterWidth }, [
        h(Show, { above: "sm" }, [
          h(
            HStack,
            {
              minWidth: gutterWidth,
              sx: { position: "sticky", top: "60px" },
              justify: "end",
              paddingRight: 4,
            },
            [
              h(MenuView, {
                orientation: Orientation.vertical,
                showHomeOnly,
                onClickConversations,
                onClickOpps,
                onClickHome,
                onClickProfile,
                onClickNew,
              }),
              h(Divider, { orientation: "vertical" }),
            ]
          ),
        ]),
      ]),
      // TODO: prefer once rxjs/xstream compat fixed
      // h(FullWidthVStack, { height: "100%" }, [
      //   //
      //   headerNav,
      //   children,
      // ]),
      children,
      h(VStack, { minWidth: gutterWidth }, [
        //
        h(Spacer),
      ]),
    ]),
    // NOTE: need an empty footer to make room for nav
    h(Box, { width: "100%", minHeight: `${footerH}px` }, [
      //
      h(Spacer),
    ]),
    h(Hide, { above: "sm" }, [
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
          h(MenuView, {
            orientation: Orientation.horizontal,
            showHomeOnly,
            onClickConversations,
            onClickOpps,
            onClickHome,
            onClickProfile,
            onClickNew,
          }),
        ]
      ),
    ]),
  ])
}

View.displayName = "NavView"
