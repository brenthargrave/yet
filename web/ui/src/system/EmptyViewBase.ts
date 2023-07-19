import { Center, VStack } from "@chakra-ui/react"
import { h } from "@cycle/react"
import { FC } from "react"
import { FullWidthVStack } from "./FullWidthVStack"
import { Nav } from "./Nav"

interface Props {}

export const EmptyViewBase: FC<Props> = ({ children, ...props }) =>
  h(FullWidthVStack, {}, [
    h(Nav),
    h(Center, { ...props }, [
      h(VStack, { alignItems: "center", gap: 4, padding: 4 }, [
        //
        children,
      ]),
    ]),
  ])

EmptyViewBase.displayName = "EmptyViewBase"
