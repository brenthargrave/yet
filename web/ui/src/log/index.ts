import { create } from "rxjs-spy" // no filter, logs everything

import { tag } from "rxjs-spy/operators/tag"

const spy = create({ defaultLogger: console, sourceMaps: true })
spy.log()

const makeTagger =
  <T>(scope: string) =>
  <T>(label: string) =>
    tag<T>(`${scope} > ${label}`)

export { tag, makeTagger }
