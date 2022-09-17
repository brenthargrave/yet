import { create } from "rxjs-spy" // no filter, logs everything

import { tag } from "rxjs-spy/operators/tag"

const { VITE_API_ENV: env, VITE_LOG } = import.meta.env

console.debug("THIS log", VITE_LOG)
console.debug("THIS env", env)

const spy = create({ defaultLogger: console, sourceMaps: true })
if (VITE_LOG) spy.log()

const makeTagger =
  <T>(scope: string) =>
  <T>(label: string) =>
    tag<T>(`${scope} > ${label}`)

export { tag, makeTagger }
