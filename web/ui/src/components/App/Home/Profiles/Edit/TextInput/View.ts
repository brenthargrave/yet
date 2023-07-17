import { h } from "@cycle/react"
import { FC, useState } from "react"
import { Input } from "~/system"

export interface Props {
  isDisabled?: boolean
  onChange?: (value: string) => void
  defaultValue?: string
  autoFocus?: boolean
  placeholder?: string
}

export const View: FC<Props> = ({
  onChange: _onChange,
  defaultValue,
  isDisabled = true,
  autoFocus = false,
  placeholder,
  ...props
}) => {
  const [value, setValue] = useState(defaultValue)
  const onChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    const next = event.target.value
    if (next.length >= 2) {
      setValue(next)
      if (_onChange) _onChange(next)
    }
  }
  return h(Input, {
    autoFocus,
    onChange,
    placeholder,
    value,
  })
}
