import { EMPTY, merge, of, tap } from "rxjs"
import { switchMap } from "rxjs/operators"
import { match } from "ts-pattern"
import { t } from "~/i18n"
import { makeTagger } from "~/log"
import { push, routes, Source as RouterSource } from "~/router"
import { shareLatest } from "~/rx"
import { toast } from "~/toast"

export interface Sources {
  router: RouterSource
}

export const Oauth = (sources: Sources, tagPrefix?: string) => {
  const tagScope = `${tagPrefix}/Oauth`
  const tag = makeTagger(tagScope)

  const { history$: _history$ } = sources.router
  const history$ = _history$.pipe(tag("history$"), shareLatest())

  // TODO: use notice driver instead
  const result$ = history$.pipe(
    switchMap((route) => {
      return match(route)
        .with({ name: routes.oauth.name }, ({ params }) => {
          return of(params)
        })
        .otherwise(() => EMPTY)
    }),
    tap(({ status, title, description }) => {
      toast({
        status: status === "error" ? "error" : "info",
        title,
        description,
      })
    }),
    tag("$result")
  )

  const redirect$ = result$.pipe(
    switchMap((_result) => of(push(routes.me()))),
    tag("redirectHome$")
  )

  const router = merge(redirect$)

  return {
    router,
  }
}
