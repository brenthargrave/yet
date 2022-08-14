import { ExternalLinkIcon } from "@chakra-ui/icons"
import {
  IconButton,
  Input,
  InputGroup,
  InputProps,
  InputRightElement,
} from "@chakra-ui/react"
import { h } from "@cycle/react"
import { FC, useState } from "react"

const size = "md"

const placeholder = "https://jobs.com/..."

const isValidURL = (value: string | null | undefined): boolean => {
  if (value) {
    try {
      const _url = new URL(value)
      return true
    } catch (_) {
      return false
    }
  } else {
    return false
  }
}

interface Props extends Omit<InputProps, "onChange" | "defaultValue"> {
  onChange?: (value: string) => void
  defaultValue?: string | null
}

export const UrlInput: FC<Props> = ({ onChange: _onChange, defaultValue }) => {
  const [url, setUrl] = useState(defaultValue)
  const [isDisabled, setDisabled] = useState(true)
  const onChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const { value } = e.currentTarget
    setUrl(value)
    setDisabled(!isValidURL(value))
    if (_onChange) _onChange(value)
  }

  return h(InputGroup, { size }, [
    h(Input, { onChange, defaultValue, placeholder }),
    h(InputRightElement, {}, [
      h(IconButton, {
        size: "sm",
        icon: h(ExternalLinkIcon),
        isDisabled,
        onClick: () => url && window.open(url, "_blank"),
      }),
    ]),
  ])
}
