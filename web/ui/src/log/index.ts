import { create } from "rxjs-spy"

const spy = create({ defaultLogger: console, sourceMaps: true })
spy.log() // no filter, logs everything

export { tag } from "rxjs-spy/operators/tag"
