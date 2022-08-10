import { h } from "@cycle/react"
import { FC } from "react"

interface Props {}

export const View: FC<Props> = ({ ...props }) => h("div", "Hello")
