import { Button, Box } from "@chakra-ui/react"
import { h } from "@cycle/react"
import { FC } from "react"
import { t } from "~/i18n"

export const EmptyView: FC = () =>
  h(Box, {}, [
    // TODO: CTA?
    h(Button, {}, t(`note.empty.buttonCopy`)),
  ])
