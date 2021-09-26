import { h } from "@cycle/react"
import { useState } from "react"
import { phone as validatePhone } from "phone"
import { useApolloClient } from "@apollo/client"

import { View } from "./View"
import { GetEventsDocument } from "~/graph/generated"

export { View }

export const PhoneSubmit = () => {
  const [phone, setPhone] = useState("")
  const [isDisabled, setDisabled] = useState<boolean>(true)
  const [isLoading, setLoading] = useState<boolean>(false)
  const onChangePhone: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    const { value } = event.currentTarget
    setPhone(value)
    const { isValid } = validatePhone(value, {
      country: "USA",
      strictDetection: true,
    })
    setDisabled(!isValid)
  }
  const client = useApolloClient()
  const onClickSubmit = async () => {
    setDisabled(true)
    setLoading(true)
    const result = await client.query({ query: GetEventsDocument })
    console.debug(result)
  }

  return h(View, { phone, onChangePhone, isDisabled, onClickSubmit, isLoading })
}
