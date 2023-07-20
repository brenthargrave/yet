import { create } from "rxjs-spy" // no filter, logs everything

import { tag } from "rxjs-spy/operators"

const { VITE_API_ENV: env, VITE_LOG } = import.meta.env

const spy = create({ defaultLogger: console, sourceMaps: true })
if (env === "prod") {
  console.log("skip logging")
} else {
  spy.log()
}

interface TagOptions {
  focus?: boolean
}
const makeTagger =
  <T>(scope: string) =>
  <T>(label: string, opts?: TagOptions) => {
    return opts?.focus
      ? tag<T>(`${scope} > THIS ${label}`)
      : tag<T>(`${scope} > ${label}`)
  }

export { tag, makeTagger }
