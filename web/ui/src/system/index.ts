import { h } from "@cycle/react"
import {
  Center as _Center,
  CenterProps,
  Stack as _Stack,
  StackProps,
  Heading as _Heading,
  HeadingProps,
  Text as _Text,
  TextProps,
} from "@chakra-ui/react"

export const Center = (props: CenterProps) => h(_Center, props)
export const Heading = (props: HeadingProps) => h(_Heading, props)
export const Stack = (props: StackProps) => h(_Stack, props)
export const Text = (props: TextProps) => h(_Text, props)
