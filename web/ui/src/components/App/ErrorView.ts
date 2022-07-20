import { h } from "@cycle/react"
import { FC } from "react"
import { UserError } from "~/graph"
import { Center, Text } from "~/system"

export interface Props {
  error: UserError
}

export const ErrorView: FC<Props> = ({ error }) =>
  h(Center, { height: "100vh" }, [
    //
    h(Text, `Oops! ${error?.message}`),
  ])
