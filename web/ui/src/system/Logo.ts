import { Heading, Box, HStack, Text, VStack } from "@chakra-ui/react"
import { h } from "@cycle/react"
import { createRef, FC, useLayoutEffect, useState } from "react"
import { productName } from "~/i18n"

export enum LogoLocation {
  splash,
  nav,
}

interface Props {
  location: LogoLocation
}

export const Logo: FC<Props> = ({ location = LogoLocation.nav }) => {
  const isNav = location === LogoLocation.nav
  const headingProps = isNav
    ? {
        size: "xs",
        mr: -1,
      }
    : {
        size: "lg",
      }

  const ref = createRef<HTMLElement>()
  const [left, setLeft] = useState(0)
  const [top, setTop] = useState(0)
  useLayoutEffect(() => {
    const t = ref.current?.offsetTop
    const l = ref.current?.offsetLeft
    const w = ref.current?.offsetWidth
    if (t) {
      setTop(t)
    }
    if (l && w) {
      setLeft(l + w)
    }
  })

  return h(HStack, { alignItems: "start" }, [
    //
    h(
      Heading,
      {
        ref,
        //
        ...headingProps,
        "aria-label": productName,
      },
      productName
    ),
    h(
      Box,
      {
        //
        // backgroundColor: "green.50",
        backgroundColor: "gray.50",
        borderRadius: "sm",
        padding: 0.5,
        pl: 1,
        pr: 1,
        ...(!isNav && {
          sx: {
            position: "fixed",
            top,
            left,
          },
        }),
      },
      [
        h(
          Text,
          {
            fontSize: isNav ? "0.5rem" : "xs",
          },
          "BETA"
        ),
      ]
    ),
  ])
}
