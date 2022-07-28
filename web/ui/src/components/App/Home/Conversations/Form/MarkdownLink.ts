import { h } from "@cycle/react"
import { FC } from "react"
import { RiMarkdownFill } from "react-icons/ri"
import { Icon, Link } from "@chakra-ui/react"
import { Stack, Text } from "~/system"

export const MarkdownLink: FC = () =>
  h(Stack, { direction: "row", alignItems: "center", pt: 1 }, [
    h(Icon, { as: RiMarkdownFill }),
    h(Text, { fontSize: "xs" }, [
      h(
        Link,
        {
          isExternal: true,
          href: "https://docs.github.com/en/get-started/writing-on-github/getting-started-with-writing-and-formatting-on-github/basic-writing-and-formatting-syntax",
        },
        ` Styling with Markdown is supported`
      ),
    ]),
  ])
