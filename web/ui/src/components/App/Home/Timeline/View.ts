import { Heading, Spacer } from "@chakra-ui/react"
import { h } from "@cycle/react"
import { FC } from "react"
import { FullWidthVStack, Header, modalStyleProps, Nav } from "~/system"
// import { EmptyOppsView, OnClickNew } from "./EmptyView"

const { minHeight } = modalStyleProps

interface Props {}

export const View: FC<Props> = () =>
  // isEmpty(opps)
  //   ? h(EmptyOppsView, { minHeight, onClickCreate })
  h(FullWidthVStack, { minHeight }, [
    h(Nav),
    h(Header, {}, [
      //
      h(Heading, { size: "md" }, "Latest"),
      h(Spacer),
    ]),
  ])
