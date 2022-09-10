import { Input, InputGroup, InputLeftAddon, InputProps } from "@chakra-ui/react"
import { h } from "@cycle/react"
import { FC, useState } from "react"
import { isEmpty } from "~/fp"
import { Currency, Money } from "~/graph"
import { formatMoney } from "~/i18n"

const format = (money: Money, locale = "en-US"): string =>
  formatMoney(money, locale).replace("$", "")

interface Props extends Omit<InputProps, "onChange"> {
  money?: Money
  onChange?: (money: Money) => void
}

export const MoneyInput: FC<Props> = ({
  money = { amount: 0, currency: Currency.Usd },
  onChange: _onChange,
  ...rest
}) => {
  const [value, setValue] = useState(format(money))
  const onChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const providedValue = e.currentTarget.value
    const cleaned = providedValue.replace(/\D/g, "")
    const amount = isEmpty(cleaned) ? 0 : Number.parseInt(cleaned, 10)
    const newMoney: Money = { amount, currency: money.currency }
    const newValue = format(newMoney)
    setValue(newValue)
    if (_onChange) _onChange(newMoney)
  }
  return h(InputGroup, [
    // h(InputLeftElement, {
    //   pointerEvents: "none",
    //   // color: "gray.300",
    //   // fontSize: "1.2em",
    //   children: "$",
    //   spacing: 0,
    //   padding: 0,
    // }),
    h(InputLeftAddon, "$"),
    h(Input, { onChange, value, ...rest }),
  ])
}
