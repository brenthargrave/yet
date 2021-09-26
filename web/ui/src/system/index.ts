import { h } from "@cycle/react"
import {
  Button as _Button,
  ButtonProps,
  Center as _Center,
  CenterProps,
  Divider as _Divider,
  DividerProps,
  Heading as _Heading,
  HeadingProps,
  Input as _Input,
  InputAddon as _InputAddon,
  InputAddonProps,
  InputGroup as _InputGroup,
  InputGroupProps,
  InputProps,
  Stack as _Stack,
  StackProps,
  Text as _Text,
  TextProps,
} from "@chakra-ui/react"

export const Button = (props: ButtonProps) => h(_Button, props)
export const Center = (props: CenterProps) => h(_Center, props)
export const Divider = (props: DividerProps) => h(_Divider, props)
export const Heading = (props: HeadingProps) => h(_Heading, props)
export const Input = (props: InputProps) => h(_Input, props)
export const InputAddon = (props: InputAddonProps) => h(_InputAddon, props)
export const InputGroup = (props: InputGroupProps) => h(_InputGroup, props)
export const Stack = (props: StackProps) => h(_Stack, props)
export const Text = (props: TextProps) => h(_Text, props)
