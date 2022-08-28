import { Spacer } from "@chakra-ui/react"
import { h } from "@cycle/react"
import { FC } from "react"
import { BackButton, Header } from "~/system"

interface Props {
  onClickBack?: () => void
  backButtonText?: string
}

export const Nav: FC<Props> = ({ onClickBack, backButtonText: cta }) =>
  h(Header, { paddingBottom: 0 }, [
    onClickBack &&
      h(BackButton, {
        cta,
        onClick: onClickBack,
      }),
    h(Spacer, { minHeight: "24px" }),
  ])
