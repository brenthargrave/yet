import { h } from "@cycle/react"
import { FC } from "react"
import { productName } from "~/i18n"
import { maxWidth, Heading, Stack, Center, Box } from "~/system"

const Centered: FC = ({ children }) => h(Center, { width: "100%" }, [children])
Centered.displayName = "Centered"

const InnerHeader: FC = ({ children }) =>
  h(Box, { width: "100%", maxWidth, p: 4 }, [children])

InnerHeader.displayName = "InnerHeader"

export const View = () =>
  h(Centered, [h(InnerHeader, [h(Heading, { size: "md" }, productName)])])
