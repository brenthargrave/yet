import { h } from "@cycle/react"
import {
  Alert as _Alert,
  AlertDescription as _AlertDescription,
  AlertDescriptionProps,
  AlertIcon as _AlertIcon,
  AlertIconProps,
  AlertProps,
  AlertTitle as _AlertTitle,
  AlertTitleProps,
  Button as _Button,
  ButtonProps,
  Box as _Box,
  BoxProps,
  Center as _Center,
  CenterProps,
  Divider as _Divider,
  DividerProps,
  Flex as _Flex,
  FlexProps,
  Heading as _Heading,
  HeadingProps,
  Icon as _Icon,
  IconProps,
  IconButton as _IconButton,
  IconButtonProps,
  Input as _Input,
  InputAddon as _InputAddon,
  InputAddonProps,
  InputGroup as _InputGroup,
  InputGroupProps,
  InputLeftElement,
  InputProps,
  PinInput as _PinInput,
  PinInputProps,
  PinInputField as _PinInputField,
  PinInputFieldProps,
  Spacer as _Spacer,
  SpacerProps,
  Stack as _Stack,
  StackProps,
  Text as _Text,
  TextProps,
  forwardRef,
} from "@chakra-ui/react"
import { FC } from "react"

export const Alert = (props: AlertProps) => h(_Alert, props)
export const AlertIcon = (props: AlertIconProps) => h(_AlertIcon, props)
export const AlertTitle = (props: AlertTitleProps) => h(_AlertTitle, props)
export const AlertDescription = (props: AlertDescriptionProps) =>
  h(_AlertDescription, props)
export const Box = (props: BoxProps) => h(_Box, props)
export const Button = forwardRef(({ ...rest }: ButtonProps, ref) =>
  h(_Button, { ...rest, ref })
)
export const Center = (props: CenterProps) => h(_Center, props)
export const Divider = (props: DividerProps) => h(_Divider, props)
export const Flex = (props: FlexProps) => h(_Flex, props)
export const Heading = (props: HeadingProps) => h(_Heading, props)
export const Icon = (props: IconProps) => h(_Icon, props)
export const IconButton = (props: IconButtonProps) => h(_IconButton, props)
export const Input = forwardRef(({ ...rest }: InputProps, ref) =>
  h(_Input, { ...rest, ref })
)
export const InputAddon = (props: InputAddonProps) => h(_InputAddon, props)
export const InputGroup = (props: InputGroupProps) => h(_InputGroup, props)
export { InputLeftElement }
export const Spacer = (props: SpacerProps) => h(_Spacer, props)
export const Stack = (props: StackProps) => h(_Stack, props)
export const Text = (props: TextProps) => h(_Text, props)
export const PinInput = (props: PinInputProps) => h(_PinInput, props)
export const PinInputField = (props: PinInputFieldProps) =>
  h(_PinInputField, props)

export * from "./styles"

export * from "./AutosizeTextarea"
export * from "./MarkdownView"
export * from "./Nav"
export * from "./FullWidthVStack"
export * from "./LinkedListItem"
export * from "./FullWidthList"
export * from "./EmptyViewBase"
export * from "./EditButton"
export * from "./InputControl"
export * from "./CancelButton"

export { Header } from "./Header"
export { BackButton } from "./BackButton"
export { CreateButton } from "./CreateButton"
export { ActionButton } from "./ActionButton"
export { View as Modal } from "./Modal"
export type { Props as ModalProps } from "./Modal"
export { ShareModal } from "./ShareModal"
export type { Props as ShareModalProps } from "./ShareModal"
export { Status } from "./Status"
