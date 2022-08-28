import { List, ListProps } from "@chakra-ui/react"
import { h } from "@cycle/react"
import { FC } from "react"

export interface Props extends ListProps {}

export const FullWidthList: FC<Props> = ({ children, ...props }) =>
  h(List, { width: "100%", spacing: 8, pt: 4, ...props }, [children])

FullWidthList.displayName = "FullWidthList"
