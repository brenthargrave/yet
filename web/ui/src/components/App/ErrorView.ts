import { h } from "@cycle/react"
import { FC } from "react"
import { UserError } from "~/graph"
import { ariaLabel, Center, Text } from "~/system"

export interface Props {
  error: UserError
}

export const ErrorView: FC<Props> = ({ error }) =>
  h(Center, { height: "100vh" }, [
    //
    h(Text, { ...ariaLabel("Not found") }, `Oops! ${error?.message}`),
  ])
