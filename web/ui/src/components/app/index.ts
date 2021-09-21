import { h } from "@cycle/react"

import { Landing } from "../Landing"

const { VITE_API_ENV } = import.meta.env
// eslint-disable-next-line no-console
console.log(`API_ENV: ${VITE_API_ENV}`)

export const App = () => h(Landing)
