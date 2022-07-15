import { FC } from "react"
import { h } from "@cycle/react"
import { View as AppView } from "../View"
import { View as HeaderView } from "../Header/View"
import { View } from "./View"

export const ContainerView: FC = ({ children }) =>
  // h(AppView, { header: h(HeaderView), body: h(View, [children]) })
  h(AppView, { header: null, body: h(View, [children]) })
