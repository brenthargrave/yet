import { h } from "@cycle/react"
import {
  Button as _Button,
  ButtonProps,
  Center as _Center,
  CenterProps,
  Heading as _Heading,
  HeadingProps,
  Stack as _Stack,
  StackProps,
  Text as _Text,
  TextProps,
} from "@chakra-ui/react"

export const Button = (props: ButtonProps) => h(_Button, props)
export const Center = (props: CenterProps) => h(_Center, props)
export const Heading = (props: HeadingProps) => h(_Heading, props)
export const Stack = (props: StackProps) => h(_Stack, props)
export const Text = (props: TextProps) => h(_Text, props)
