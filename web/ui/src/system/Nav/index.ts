import { Spacer } from "@chakra-ui/react"
import { h } from "@cycle/react"
import { FC } from "react"
import { BackButton, Header } from "~/system"

interface Props {
  onClickBack?: () => void
}

export const Nav: FC<Props> = ({ onClickBack }) =>
  h(Header, { paddingBottom: 0 }, [
    onClickBack &&
      h(BackButton, {
        onClick: onClickBack,
      }),
    h(Spacer, { minHeight: "24px" }),
  ])
