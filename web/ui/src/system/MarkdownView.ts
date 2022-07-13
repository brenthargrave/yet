import { h } from "@cycle/react"
import { div } from "@cycle/react-dom"
import { Prose } from "@nikolovlazar/chakra-ui-prose"
import DOMPurify from "dompurify"
import { marked } from "marked"
import { FC } from "react"
import { join, split, take } from "~/fp"

marked.setOptions({
  gfm: true,
  breaks: true,
})

interface Props {
  md: string
  maxLines?: number
}

export const MarkdownView: FC<Props> = ({ md, maxLines }) => {
  const truncated = maxLines ? join("\n", take(maxLines, split("\n", md))) : md
  const parsed = marked.parse(truncated)
  const __html = DOMPurify.sanitize(parsed)
  return h(Prose, [div({ dangerouslySetInnerHTML: { __html } })])
  // return h("div", { dangerouslySetInnerHTML: { __html } })
}
