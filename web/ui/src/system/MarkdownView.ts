import { h } from "@cycle/react"
import { a } from "@cycle/react-dom"
import { FC } from "react"
import ReactMarkdown from "react-markdown"
import remarkBreaks from "remark-breaks"
import remarkGfm from "remark-gfm"
import { style } from "typestyle"
import { join, split, take, trim } from "~/fp"

export const bold = (value: string) => `**${value}**`
export const i = (value: string) => `*${value}*`

const className = style({ textDecoration: "underline" })

// @ts-ignore
const { VITE_HOST } = import.meta.env

interface Props {
  md?: string | null
  maxLines?: number
}

export const MarkdownView: FC<Props> = ({ md, maxLines }) => {
  const mkd = md ?? ""
  let children = mkd
  if (maxLines) {
    const allLines = split("\n", mkd)
    children = join("\n", take(maxLines, allLines))
    if (allLines.length > maxLines) {
      children = `${children}...`
    }
  }
  // NOTE: otherwise consecutive newlines don't generated breaks
  // TODO: PR fix on remarkBreaks lib
  // https://github.com/remarkjs/react-markdown/issues/278#issuecomment-628264062
  children = children.replace(/\n/gi, "\n &nbsp;")
  return h(ReactMarkdown, {
    children,
    remarkPlugins: [remarkBreaks, remarkGfm],
    // NOTE: open off-domain links in new tab
    // linkTarget: "_blank"
    linkTarget: (href, children, title) =>
      href.includes(VITE_HOST) ? "_self" : "_blank",
    skipHtml: false,
    components: {
      a: ({ node, href, children, ...props }) =>
        a({ href, className, ...props }, children),
    },
  })
}
