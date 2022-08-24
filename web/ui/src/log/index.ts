import { create } from "rxjs-spy" // no filter, logs everything

import { tag } from "rxjs-spy/operators/tag"

// @ts-ignore
const { VITE_API_ENV: env } = import.meta.env

const spy = create({ defaultLogger: console, sourceMaps: true })
if (env !== "prod") spy.log()

const makeTagger =
  <T>(scope: string) =>
  <T>(label: string) =>
    tag<T>(`${scope} > ${label}`)

export { tag, makeTagger }
