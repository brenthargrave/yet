import { h } from "@cycle/react"
import { Fragment, useEffect, useState } from "react"
import { switchMap, tap } from "rxjs/operators"

import { context } from "~/context"
import { Landing } from "~/components/Landing"
import { Auth } from "~/components/Auth"
import { useRoute } from "~/router"

export const App = () => {
  const [error, setError] = useState<string>()
  const { errors$ } = context
  // TODO: log rxjs
  useEffect(() => {
    const subscription = errors$
      .pipe(
        switchMap((errors) => {
          console.debug("ERROR")
          console.debug(errors)
          const message = errors.toString()
          setError(message)
          return message
        })
      )
      .subscribe()
    return () => subscription.unsubscribe()
  }, [errors$])

  const currentRoute = useRoute()
  return h(Fragment, [
    // TODO: present global error
    currentRoute.name === "home" && h(Landing),
    currentRoute.name === "in" && h(Auth, { context }),
  ])
}
