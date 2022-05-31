import { Textarea } from "@chakra-ui/react"
import { h } from "@cycle/react"
import { t } from "~/i18n"
import { Stack } from "~/system"

export interface Props {
  value: string | null
  size?: "xs" | "sm" | "md" | "lg"
}

export const View = ({ value, size = "md" }: Props) =>
  h(Stack, { direction: "column", alignItems: "start", width: "100%" }, [
    h(Textarea, {
      value,
      size,
      placeholder: t("note.draft.placeholder"),
    }),
    // TODO: embed helpers: opp, links, ?
    // h(Stack, { direction: "row", alignItems: "start", width: "100%" }, [
    //   h(Link, { justifySelf: "left" }, `Add opportunity`),
    // ]),
  ])
