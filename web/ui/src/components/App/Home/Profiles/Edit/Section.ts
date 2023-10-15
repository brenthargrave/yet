import { FormLabel, Stack, StackProps, VStack } from "@chakra-ui/react"
import { h } from "@cycle/react"
import { FC, ReactNode } from "react"

export interface Props extends StackProps {
  heading?: string
  leftIcon?: ReactNode
  size?: string
}

export const Section: FC<Props> = ({
  children,
  heading,
  leftIcon,
  size,
  direction = "row",
  align = "center",
  spacing,
  ...props
}) => {
  return h(
    VStack,
    {
      //
      alignItems: "start",
      spacing: 2,
      minHeight: "110px",
      ...props,
    },
    [
      heading && h(FormLabel, { size }, heading),
      h(
        Stack,
        {
          //
          direction,
          align,
          spacing,
          ...props,
        },
        [
          //
          leftIcon,
          children,
        ]
      ),
    ]
  )
}

Section.displayName = "Section"
